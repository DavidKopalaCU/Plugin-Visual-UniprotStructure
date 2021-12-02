export default class UnitprotRDFService {

    BASE_URL = null;

    constructor(base_url = 'https://www.uniprot.org/uniprot') {
        this.BASE_URL = base_url;
    }

    query = async (accession) => {
        const url = `${ this.BASE_URL }/${ accession }.xml`;
        const result = await fetch(url);
        const text = await result.text();

        const parser = new DOMParser()
        const doc = parser.parseFromString(text, "text/xml");
        return doc;
    }
}