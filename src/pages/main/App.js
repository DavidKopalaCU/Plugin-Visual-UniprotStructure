import React from 'react';
import './App.css';

import ProtvistaStructure from 'protvista-structure';
import UniprotContext from '../../contexts/uniprot';

function App() {

  const [sbhComponent, setSbhComponent] = React.useState(null);
  const [uniprotInfo, setUniprotInfo] = React.useState(null);

  // Required for the browser to render Nightingale components
  React.useEffect(() => {
    if (!window.customElements.get('protvista-structure')) {
      window.customElements.define('protvista-structure', ProtvistaStructure);
    }
  }, []);

  const uniprot = React.useContext(UniprotContext);

  React.useEffect(() => {
    const usp_data = window.usp_data || {
      "complete_sbol": "http://localhost:7777/user/davidkopala/SynBioHubParts/BBa_C0040/1/3cdd32986de7f46cf2af7ac382340308dd035f96/share/sbol",
      "genbank": "http://localhost:7777/user/davidkopala/SynBioHubParts/BBa_C0040/1/3cdd32986de7f46cf2af7ac382340308dd035f96/share/gb", 
      "instanceUrl": "http://localhost:7777/", 
      "shallow_sbol": "http://localhost:7777/user/davidkopala/SynBioHubParts/BBa_C0040/1/3cdd32986de7f46cf2af7ac382340308dd035f96/share/sbolnr", 
      "size": 9, 
      "top_level": "http://localhost:7777/user/davidkopala/SynBioHubParts/BBa_C0040/1", 
      "type": "Component"
    }
    // const usp_root_url = window.usp_root_url || 'http://10.0.0.16:8080/';

    setSbhComponent(usp_data);
    setUniprotInfo(null);

    (async () => {
      const blast = uniprot.BLASTService();
      const rdf = uniprot.RDFService();

      const genbank_response = await fetch(usp_data.genbank);
      const genbank_text = await genbank_response.text();
      const regex = /^\s*[\d]+(?<seq>.*)$/gm;
      const matches = [...genbank_text.matchAll(regex)];
      const sequence_lines = matches.map((match) => match.groups.seq);
      const sequence = sequence_lines.join('').replaceAll(' ', '');

      const blast_job = await blast.query(sequence);
      const blast_results = await blast_job.awaitResult();
      const protein = await rdf.query(blast_results[0].accession);
      console.log(protein);

      const pdb_elems = [...protein.getElementsByTagName('dbReference')].filter((elem) => elem.getAttribute('type') === 'PDB');
      console.log({ protein, pdb_elems })
      if (pdb_elems.length > 0) {
        setUniprotInfo({
          accession: protein.getElementsByTagName('accession')[0].innerHTML,
          structureid: pdb_elems[0].id
        });
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
    return (
      <div className="App">
        <p>Loading Uniprot data for the component</p>
      </div>
    )
  } else {
    return (
      <div className="App">
        <p>Did not receive data from SynBioHub. Please double check the configuration!</p>
      </div>
    )
  }
}

export default App;
