from flask import Flask, request, abort
import os
import sys
import traceback


app = Flask(__name__)


@app.route("/status")
def status():
    return("The Visualisation Test Plugin Flask Server is up and running")


@app.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json(force=True)
    rdf_type = data['type']

    # ~~~~~~~~~~~~ REPLACE THIS SECTION WITH OWN RUN CODE ~~~~~~~~~~~~~~~~~~~
    # uses rdf types
    accepted_types = {'Activity', 'Agent', 'Association', 'Attachment',
                      'Collection', 'CombinatorialDerivation', 'Component',
                      'ComponentDefinition', 'Cut', 'Experiment',
                      'ExperimentalData', 'FunctionalComponent',
                      'GenericLocation', 'Implementation', 'Interaction',
                      'Location', 'MapsTo', 'Measure', 'Model', 'Module',
                      'ModuleDefinition', 'Participation', 'Plan', 'Range',
                      'Sequence', 'SequenceAnnotation', 'SequenceConstraint',
                      'Usage', 'VariableComponent'}

    acceptable = rdf_type in accepted_types

    # # to ensure it shows up on all pages
    # acceptable = True
    # ~~~~~~~~~~~~~~~~~~~~~~~~~~ END SECTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    if acceptable:
        return f'The type sent ({rdf_type}) is an accepted type', 200
    else:
        return f'The type sent ({rdf_type}) is NOT an accepted type', 415


@app.route("/run", methods=["POST"])
def run():
    data = request.get_json(force=True)

    top_level_url = data['top_level']
    complete_sbol = data['complete_sbol']
    instance_url = data['instanceUrl']
    size = data['size']
    rdf_type = data['type']
    shallow_sbol = data['shallow_sbol']

    url = complete_sbol.replace('/sbol', '')

    cwd = os.getcwd()
    filename = os.path.join(cwd, "Test.html")

    try:
        # ~~~~~~~~~~~~ REPLACE THIS SECTION WITH OWN RUN CODE ~~~~~~~~~~~~~~~~~~~
        with open(filename, 'r') as htmlfile:
            result = htmlfile.read()

        # put in the url, uri, and instance given by synbiohub
        result = result.replace("URL_REPLACE", url)
        result = result.replace("URI_REPLACE", top_level_url)
        result = result.replace("INSTANCE_REPLACE", instance_url)
        result = result.replace("SIZE_REPLACE", str(size))
        result = result.replace("RDFTYPE_REPLACE", rdf_type)
        result = result.replace("SHALLOWSBOL_REPLACE", shallow_sbol)

        result = result.replace("REQUEST_REPLACE", str(data))
        # ~~~~~~~~~~~~~~~~~~~~~~~~~~ END SECTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        return result
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        lnum = exc_tb.tb_lineno
        abort(400, f'Exception is: {e}, exc_type: {exc_type}, exc_obj: {exc_obj}, fname: {fname}, line_number: {lnum}, traceback: {traceback.format_exc()}')
