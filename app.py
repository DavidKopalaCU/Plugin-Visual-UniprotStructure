from posix import listdir
from flask import Flask, request, abort, render_template, render_template_string, send_from_directory, jsonify
from flask_cors import cross_origin
import os
import sys
import traceback
import json

from flask.helpers import url_for
from werkzeug.exceptions import BadRequest

from uniprot import UniprotClient


app = Flask(__name__)

html_template: str = None
with open(os.path.join(app.static_folder, "../index.html"), "r") as html_file:
    html_template = html_file.read()
    html_template = html_template.replace("/static", "{{ ROOT_URL }}/static")

print(html_template)


@app.route("/status")
def status():
    return("The Uniprot Structure Visualisation Plugin Flask Server is up and running")


@app.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json(force=True)
    rdf_type = data['type']

    if rdf_type == 'Component':
        return f'The type sent ({rdf_type}) is an accepted type', 200
    else:
        return f'The type sent ({rdf_type}) is NOT an accepted type', 415


@app.route("/run", methods=["GET", "POST"])
def run():
    # data = request.get_json(force=True)
    data = request.get_json() or dict()

    ROOT_URL = '/'.join(request.base_url.split('/')[:3]) + '/'

    static_js_path = os.path.join(app.static_folder, 'js')
    static_css_path = os.path.join(app.static_folder, 'css')

    static_js_files = filter(lambda filename: filename.endswith('.js'), os.listdir(static_js_path))
    static_css_files = filter(lambda filename: filename.endswith('.css'), os.listdir(static_css_path))

    static_js_urls = map(lambda filename: ROOT_URL + url_for('static', filename=f'js/{ filename }'), static_js_files)
    static_css_urls = map(lambda filename: ROOT_URL + url_for('static', filename=f'css/{ filename }'), static_css_files)
    
    return render_template_string(html_template, js_files=static_js_urls, css_files=static_css_urls, ROOT_URL=ROOT_URL, DATA=data)

@app.route("/api/uniprot/BLAST", methods=['POST'])
@cross_origin()
def uniprot_blast():
    sequence = request.data
    if sequence is None:
        return BadRequest('Missing BLAST sequence')

    return UniprotClient.BLAST(sequence)

@app.route("/api/uniprot/BLAST/<string:blast_id>/status")
@cross_origin()
def uniprot_blast_status(blast_id):
    return UniprotClient.BLASTStatus(blast_id)

@app.route('/api/uniprot/BLAST/<string:blast_id>/results')
@cross_origin()
def uniprot_blast_results(blast_id):
    results = UniprotClient.BLASTResults(blast_id)
    if results is None:
        return BadRequest('Invalid BLAST ID')

    return jsonify(results)


@app.route("/static/<path:path>", methods=['GET'])
def get_static_file(path):
    return send_from_directory('static', path)

@app.route("/<path:path>", methods=['GET'])
def get_another_file(path):
    return send_from_directory('/mnt/data/CUBoulder/2021Fall/ECEN4003/plugin-visual-uniprotstructure/build/', path)