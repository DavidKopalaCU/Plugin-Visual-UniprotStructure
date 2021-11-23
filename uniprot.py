import requests
import os

class UniprotClient:
    """Uniprot API Client
    """

    BLAST_BASE_URL = 'https://www.uniprot.org/blast/'
    BLAST_UNIPROT_PATH = 'uniprot'
    BLAST_STATUS_EXT = 'stat'
    BLAST_RESULTS_EXT = 'ovr'

    @staticmethod
    def BLAST(sequence):
        payload = {
            'blastQuery': sequence,
            'dataset': 'uniprotkb_bacteria',
            'threshold': 10,
            'matrix': None,
            'blastFilter': False,
            'gapped': True,
            'alignments': 250,
            'redirect': True,
            'landingPage': False,
            'day': 327
        }
        response =  requests.post(UniprotClient.BLAST_BASE_URL, data=payload)
        response_url = response.url
        blast_job_id = response_url.split('/')[-1]
        return blast_job_id

    @staticmethod
    def BLASTStatus(blast_id):
        URL = os.path.join(UniprotClient.BLAST_BASE_URL, UniprotClient.BLAST_UNIPROT_PATH, f"{ blast_id }.{UniprotClient.BLAST_STATUS_EXT}")
        return requests.get(URL).text

    @staticmethod
    def BLASTResults(blast_id):
        status = UniprotClient.BLASTStatus(blast_id)
        if status != 'COMPLETED':
            return None

        URL = os.path.join(UniprotClient.BLAST_BASE_URL, UniprotClient.BLAST_UNIPROT_PATH, f"{ blast_id }.{UniprotClient.BLAST_RESULTS_EXT}")
        return requests.get(URL).json()