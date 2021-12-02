import BLASTService from './BLASTService';
import RDFService from './RDFService';

export default class UniprotServiceFactory {

    BASE_URL = null;
    BLAST_API_PATH = null;
    RDF_API_PATH = null;

    constructor({ 
        base_url = 'https://www.uniprot.org', 
        blast_api_path = 'blast',
        rdf_api_path = 'uniprot',
        ...props 
    }={}) {
        this.BASE_URL = base_url;
        this.BLAST_API_PATH = blast_api_path;
        this.RDF_API_PATH = rdf_api_path;
    }

    BLASTService = () => new BLASTService(`${ this.BASE_URL }/${ this.BLAST_API_PATH }`);
    RDFService = () => new RDFService(`${ this.BASE_URL }/${ this.RDF_API_PATH }`);

}