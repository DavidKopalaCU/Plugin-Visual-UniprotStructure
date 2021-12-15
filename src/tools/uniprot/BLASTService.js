/**
 * A simple class that contains logic for performing BLAST queries on Uniprot
 */
export default class UniprotBLASTService {

    BASE_URL = null;

    constructor(base_url = 'https://www.uniprot.org/blast') {
        this.BASE_URL = base_url;
    }

    /**
     * Starts a new BLAST query on Uniprot
     * Returns a handle that can be used to monitor the job and retrieve the results
     * @param {string} sequence The raw DNA sequence to query for
     * @returns {Promise<UniprotBLASTJob>}
     */
    query = async (sequence) => {
        const date = new Date();
        const day = Math.floor((date - new Date(date.getFullYear())) / (1000 * 60 * 60 * 24));

        const url = this.BASE_URL + '/';
        const payload = new FormData();
        payload.append('blastQuery', sequence);
        payload.append('dataset', 'uniprotkb_bacteria');
        payload.append('threshold', 10);
        payload.append('blastFilter', false);
        payload.append('gapped', true);
        payload.append('alignments', 250);
        payload.append('redirect', true);
        payload.append('landingPage', false);
        payload.append('day', day);

        const response = await fetch(url, {
            method: 'POST',
            body: payload,
        });

        const response_url = response.url;
        const job_id = response_url.split('/').pop();
        return new UniprotBLASTJob(this, job_id);
    }

    /**
     * Queries Uniprot for the status of a Blast Job
     * @param {string} blast_id The UUID of a Uniprot Blast job
     * @returns {Promise<('UNKNOWN'|'RUNNING'|'COMPLETED')>}
     */
    status = async (blast_id) => {
        const url = `${ this.BASE_URL }/uniprot/${ blast_id }.stat`;

        const response = await fetch(url);
        const text = await response.text();

        if (text in BLASTJobStates) {
            return BLASTJobStates[text];
        } else {
            return BLASTJobStates.UNKNOWN;
        }
    }

    /**
     * 
     * @param {string} blast_id The UUID of a Uniprot Blast job
     * @param {number} retries If the status of the job is 'COMPLETED', this is the number of times to try downloading the data if nothing is returned from Uniprot
     * @returns {Promise<any>}
     */
    results = async (blast_id, retries=10) => {
        // Make sure that the job has COMPLETED
        const status = await this.status(blast_id);
        if (status !== BLASTJobStates.COMPLETED) {
            console.error('Blast job not completed!', blast_id);
            return null;
        }

        const url = `${ this.BASE_URL }/uniprot/${ blast_id }.ovr`;
        
        // Attempt to download the results
        // There is a bug in Uniprot's service that can cause the results
        // request to return an empty response. We address this by continuing
        // to query the endpoint until the data is available
        let results = null;
        for (let i = 0; (i < retries) && (results == null); i++) {
            try {
                const response = await fetch(url);
                results = await response.json();
            } catch (error) {
                console.error(`Could not get result from BLAST Job! ${ retries - i - 1 } retries remaining.`);
                console.error(error);
                // Kind of a hack-y way to wait 3 seconds
                await new Promise((resolve, _) => setTimeout(resolve, 3000));
            }
        }

        return results;
    }

}

/**
 * An object that provides a handle for a Uniprot BLAST Job
 * A convience class that makes it easier to query the status and results
 */
export class UniprotBLASTJob {

    /** @type {UniprotBLASTService} */
    BLAST_SERVICE = null;
    /** @type {string} The BLAST Job that this instance represents */
    BLAST_ID = null;
    /** @type {'UNKNOWN'|'RUNNING'|'COMPLETED'} The cached state of the BLAST Job */
    STATE = null;
    /** @type {Object} The cached results of the BLAST Job */
    RESULT = null;

    /**
     * @param {UniprotBLASTService} blast_service An instance of the UniprotBLASTService class; provides methods for querying the job
     * @param {string} blast_id The BLAST Job that this instance will represent
     */
    constructor(blast_service, blast_id) {
        this.BLAST_SERVICE = blast_service;
        this.BLAST_ID = blast_id;
    }

    /**
     * Queries Uniprot for the state of this job
     * @returns {Promise<'UNKNOWN'|'RUNNING'|'COMPLETED'>}
     */
    state = async () => {
        this.STATE = await this.BLAST_SERVICE.status(this.BLAST_ID);
        return this.STATE;
    }

    /**
     * Gets the results of the BLAST Job if they are available
     * @returns {Promise<Object?>}
     */
    result = async () => {
        const result_not_cached = (this.RESULT == null);
        const result_is_ready = await this.state() === BLASTJobStates.COMPLETED;
        if (result_not_cached && result_is_ready) {
            this.RESULT = await this.BLAST_SERVICE.results(this.BLAST_ID);
        }
        return this.RESULT;
    }

    /**
     * Convenience method that only resolves when results from the job are available
     * This method automatically queries Uniprot periodically
     * @param {number} period The period to wait betwen Uniprot requests; in milliseconds
     * @returns {Promise<Object>}
     */
    awaitResult = async (period=15000) => {
        while ((await this.state()) !== BLASTJobStates.COMPLETED) {
            await new Promise((resolve, _) => setTimeout(resolve, period));
        }
        return await this.result();
    }

}

export const BLASTJobStates = Object.freeze({
    'UNKNOWN': 'UNKNOWN',
    'RUNNING': 'RUNNING',
    'COMPLETED': 'COMPLETED',
});