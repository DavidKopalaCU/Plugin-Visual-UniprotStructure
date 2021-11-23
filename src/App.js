import React from 'react';
import './App.css';

import ProtvistaStructure from 'protvista-structure';

function App() {

  const [sbhComponent, setSbhComponent] = React.useState(null);
  const [uniprotInfo, setUniprotInfo] = React.useState(null);

  // Required for the browser to render Nightingale components
  React.useEffect(() => {
    if (!window.customElements.get('protvista-structure')) {
      window.customElements.define('protvista-structure', ProtvistaStructure);
    }
  }, []);

  React.useEffect(() => {
    // setTimeout(() => {
    //   setUniprotInfo({
    //     accession: "P06493",
    //     structureid: "4YC3"
    //   });
    // }, 5000);

    const usp_data = window.usp_data /* || {
      complete_sbol: "http://localhost:7777/user/davidkopala/ActualSBHParts/BBa_C0040/1/f090c7ca332a6babac8a61b92194f351bdd427ac/share/sbol",
      genbank: "http://localhost:7777/user/davidkopala/ActualSBHParts/BBa_C0040/1/f090c7ca332a6babac8a61b92194f351bdd427ac/share/gb",
      instanceUrl: "http://localhost:7777/",
      shallow_sbol: "http://localhost:7777/user/davidkopala/ActualSBHParts/BBa_C0040/1/f090c7ca332a6babac8a61b92194f351bdd427ac/share/sbolnr",
      size: 9,
      top_level: "http://localhost:7777/user/davidkopala/ActualSBHParts/BBa_C0040/1",
      type: "Component"
    };*/
    const usp_root_url = window.usp_root_url // || 'http://10.0.0.77:8080/';

    setSbhComponent(usp_data);
    setUniprotInfo(null);

    fetch(usp_data.genbank)
    .then((response) => response.text())
    .then((genbank) => {
      const regex = /^\s*[\d]+(?<seq>.*)$/gm;
      const matches = [...genbank.matchAll(regex)];
      const sequence_lines = matches.map((match) => match.groups.seq);
      const sequence = sequence_lines.join('').replaceAll(' ', '');

      return fetch(`${ usp_root_url }/api/uniprot/BLAST`, {
        method: 'POST',
        body: sequence
      });
    })
    .then((blast_response) => blast_response.text())
    .then((blast_id) => new Promise((resolve, reject) => {
      const check_blast_status = () => {
        fetch(`${ usp_root_url }/api/uniprot/BLAST/${ blast_id }/status`)
        .then((blast_status_response) => blast_status_response.text())
        .then((blast_status) => {
          if (blast_status == 'COMPLETED') {
            resolve(blast_id);
          } else {
            setTimeout(check_blast_status, 15*1000);
          }
        });
      }
      check_blast_status();
    }))
    // .then((blast_id) => new Promise((resolve, reject) => setTimeout(() => resolve(blast_id), 20*1000)))
    // .then((blast_id) => fetch(`${ usp_root_url }/api/uniprot/BLAST/${ blast_id }/results`))
    // .then((blast_results_response) => blast_results_response.json())
    .then((blast_id) => new Promise((resolve, reject) => {
      const get_blast_results = () => {
        fetch(`${ usp_root_url }/api/uniprot/BLAST/${ blast_id }/results`)
        .then((blast_result_response) => blast_result_response.json())
        .then((blast_results) => resolve(blast_results))
        .catch((error) => {
          console.error(error);
          setTimeout(get_blast_results, 1000);
        });
      }
      get_blast_results();
    }))
    .then((blast_results) => blast_results[0].accession)
    .then((accession) => fetch(`https://www.uniprot.org/uniprot/${ accession }.xml`))
    .then((uniprot_response) => uniprot_response.text())
    .then((uniprot_data) => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(uniprot_data, "text/xml");
      const pdb_elems = [...doc.getElementsByTagName('dbReference')].filter((elem) => elem.getAttribute('type') === 'PDB');
      console.log({ doc, pdb_elems })
      if (pdb_elems.length > 0) {
        setUniprotInfo({
          accession: doc.getElementsByTagName('accession')[0].innerHTML,
          structureid: pdb_elems[0].id
        });
      }
    })
  }, [window.usp_data]);

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
