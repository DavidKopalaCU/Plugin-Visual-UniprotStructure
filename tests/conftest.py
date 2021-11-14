from app import app
import pytest
import json


@pytest.fixture
def client():
    return app.test_client()


@pytest.fixture
def eval_dict():
    eval_dict = {"type": "Component"}
    eval_json = json.dumps(eval_dict)
    return eval_json


@pytest.fixture
def run_dict():
    run_dict = {"complete_sbol": "https://dev.synbiohub.org/public/igem/BBa_E0040/1/sbol",
                "shallow_sbol": "https://dev.synbiohub.org/public/igem/BBa_E0040/1/sbolnr",
                "genbank": "https://dev.synbiohub.org/public/igem/BBa_E0040/1/gb",
                "top_level": "https://synbiohub.org/public/igem/BBa_E0040/1",
                "size": 5,
                "type": "Component",
                "instanceUrl": "https://dev.synbiohub.org/"
                }
    run_json = json.dumps(run_dict)
    return run_json
