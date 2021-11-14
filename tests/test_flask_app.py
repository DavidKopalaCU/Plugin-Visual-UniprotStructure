

def test_status(client):
    resp = client.get('/status')
    assert resp.status_code == 200


def test_get_eval(client):
    resp = client.get('/evaluate')
    assert resp.status_code == 400


def test_eval_post(client, eval_dict):
    resp = client.post('/evaluate', data=eval_dict)
    assert resp.status_code == 200


def test_run_get(client, run_dict):
    # can't test run endpoint further without knowing what
    # kinds of sbol files it can handle
    # so just test that the run endpoint exists
    resp = client.get('/run')
    assert resp.status_code == 405
