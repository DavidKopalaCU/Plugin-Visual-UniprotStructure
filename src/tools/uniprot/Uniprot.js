import BLASTService from './BLASTService';
import RDFService from './RDFService';

/**
 * Your one-stop-shop for configuring all Uniprot services
 */
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

    // TODO: Cache these instances once they are created for better performance and better rendering behaviors
    BLASTService = () => new BLASTService(`${ this.BASE_URL }/${ this.BLAST_API_PATH }`);
    RDFService = () => new RDFService(`${ this.BASE_URL }/${ this.RDF_API_PATH }`);

}