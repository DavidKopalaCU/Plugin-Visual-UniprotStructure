/**
 * The content that gets rendered in the plugin view on SynBioHub
 */

import React from 'react';
import './App.css';

import ProtvistaStructure from 'protvista-structure';
import UniprotContext from '../../contexts/uniprot';

function App() {

  const [sbhComponent, setSbhComponent] = React.useState(null);
  const [uniprotInfo, setUniprotInfo] = React.useState(null);

  const [message, setMessage] = React.useState(null);
  const [blastJob, setBlastJob] = React.useState(null);
  const [blastDuration, setBlastDuration] = React.useState(null);

  // Required for the browser to render Nightingale components
  React.useEffect(() => {
    if (!window.customElements.get('protvista-structure')) {
      window.customElements.define('protvista-structure', ProtvistaStructure);
    }
  }, []);

  // Get the pre-configured Uniprot service
  const uniprot = React.useContext(UniprotContext);

  React.useEffect(() => {
    // When the backend of the plugin builds its response for SynBioHub, it inserts
    // Javascript that registers some data to this variable.
    // This is how the plugin know what component it's being displayed in
    const usp_data = window.usp_data;

    // Reset the state, so a loading message is displayed to the user
    setSbhComponent(usp_data);
    setUniprotInfo(null);
    setMessage('Starting BLAST Job...');

    let startDate = new Date();
    let durationUpdateHandle = null;
    const updateBlastDuration = () => {
      setBlastDuration(((new  Date() - startDate) / 1000).toFixed(0))
      durationUpdateHandle = setTimeout(updateBlastDuration, 1000);
    }
    const stopBlastDurationUpdate = () => {
      clearTimeout(durationUpdateHandle);
      setBlastDuration(null);
    }

    (async () => {
      try {
        const blast = uniprot.BLASTService();
        const rdf = uniprot.RDFService();
  
        const genbank_response = await fetch(usp_data.genbank);
        const genbank_text = await genbank_response.text();
        const regex = /^\s*[\d]+(?<seq>.*)$/gm;
        const matches = [...genbank_text.matchAll(regex)];
        const sequence_lines = matches.map((match) => match.groups.seq);
        const sequence = sequence_lines.join('').replaceAll(' ', '');
  
        const blast_job = await blast.query(sequence);
        startDate = new Date()
        updateBlastDuration();
        setBlastJob(blast_job.BLAST_ID);
        setMessage('Waiting for the BLAST Job to finish.')
        const blast_results = await blast_job.awaitResult();
        stopBlastDurationUpdate();
        setMessage('Downloading protein information.');
        const protein = await rdf.query(blast_results[0].accession);
        console.log(protein);
  
        setMessage('Looking for PDB elements.');
        const pdb_elems = [...protein.getElementsByTagName('dbReference')].filter((elem) => elem.getAttribute('type') === 'PDB');
        console.log({ protein, pdb_elems })
        if (pdb_elems.length > 0) {
          setUniprotInfo({
            accession: protein.getElementsByTagName('accession')[0].innerHTML,
            structureid: pdb_elems[0].id
          });
        } else {
          setMessage('No PDB elements were found! Cannot render the protein.');
        }
      } catch (error) {
        console.error(error);
        setMessage('An error occured while interacting with Uniprot.');
        stopBlastDurationUpdate();
      }
      
    })()
  }, [uniprot]);

  if (!!uniprotInfo) {
    return (
      <div className="App" style={{ minHeight: 10, minWidth: 10 }}>
        <protvista-structure { ...uniprotInfo } />
      </div>
    );
  } else if (!!sbhComponent) {
    if (!!message || !!blastDuration || !!blastJob) {
      return (
        <div className='App'>
          { (!!message) && <p>{ message }</p> }
          { (!!blastDuration) && <p>The BLAST Job has been running for { blastDuration } seconds.</p> }
          { (!!blastJob) && <p>View the BLAST Job on Uniprot <a href={ `https://uniprot.org/blast/uniprot/${ blastJob }` } target='_blank' rel='noreferrer noopener'>here</a>.</p> }
        </div>
      )
    } else {
      return (
        <div className="App">
          <p>Loading Uniprot data for the component</p>
        </div>
      )
    }
  } else {
    return (
      <div className="App">
        <p>Did not receive data from SynBioHub. Please double check the configuration!</p>
      </div>
    )
  }
}

export default App;
