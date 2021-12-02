export default class UniprotBLASTService {

    BASE_URL = null;

    constructor(base_url = 'https://www.uniprot.org/blast') {
        this.BASE_URL = base_url;
    }

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

    results = async (blast_id, retries=10) => {
        console.log('test');
        const status = await this.status(blast_id);
        if (status !== BLASTJobStates.COMPLETED) {
            console.error('Blast job not completed!', blast_id);
            return null;
        }

        const url = `${ this.BASE_URL }/uniprot/${ blast_id }.ovr`;
        
        let results = null;
        for (let i = 0; (i < retries) && (results == null); i++) {
            try {
                const response = await fetch(url);
                results = await response.json();
            } catch (error) {
                console.error(`Could not get result from BLAST Job! ${ retries - i - 1 } retries remaining.`);
                console.error(error);
                await new Promise((resolve, _) => setTimeout(resolve, 3000));
            }
        }

        return results;
    }

}

export class UniprotBLASTJob {

    /** @type {UniprotBLASTService} */
    BLAST_SERVICE = null;
    BLAST_ID = null;
    STATE = null;
    RESULT = null;

    /**
     * @param {UniprotBLASTService} blast_service 
     * @param {string} blast_id 
     */
    constructor(blast_service, blast_id) {
        this.BLAST_SERVICE = blast_service;
        this.BLAST_ID = blast_id;
    }

    state = async () => {
        this.STATE = await this.BLAST_SERVICE.status(this.BLAST_ID);
        return this.STATE;
    }

    result = async () => {
        const result_not_cached = (this.RESULT == null);
        const result_is_ready = await this.state() === BLASTJobStates.COMPLETED;
        if (result_not_cached && result_is_ready) {
            this.RESULT = await this.BLAST_SERVICE.results(this.BLAST_ID);
        }
        return this.RESULT;
    }

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