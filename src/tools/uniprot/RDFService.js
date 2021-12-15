/**
 * Wraps Uniprot RDF REST requests in an easy-to-use class
 */
export default class UnitprotRDFService {

    BASE_URL = null;

    constructor(base_url = 'https://www.uniprot.org/uniprot') {
        this.BASE_URL = base_url;
    }

    /**
     * Downloads data for the given protein from Uniprot
     * @param {string} accession The unique ID of the protein to query for
     * @returns {Promise<Document>}
     */
    query = async (accession) => {
        const url = `${ this.BASE_URL }/${ accession }.xml`;
        const result = await fetch(url);
        const text = await result.text();

        const parser = new DOMParser()
        const doc = parser.parseFromString(text, "text/xml");
        return doc;
    }
}