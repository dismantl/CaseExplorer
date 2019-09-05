from flask import (abort, render_template, request, redirect, url_for,
                   flash, current_app, jsonify, Response)

from ..api import fetch_rows
from . import main


@main.route('/api/cases', methods=['POST'])
def cases():
    return jsonify(fetch_rows('cases', request.json))

@main.route('/api/dscr', methods=['POST'])
def dscr():
    return jsonify(fetch_rows('dscr', request.json))

@main.route('/api/dsk8', methods=['POST'])
def dsk8():
    return jsonify(fetch_rows('dsk8', request.json))

@main.route('/api/cc', methods=['POST'])
def cc():
    return jsonify(fetch_rows('cc', request.json))

@main.route('/api/dscivil', methods=['POST'])
def dscivil():
    return jsonify(fetch_rows('dscivil', request.json))

@main.route('/api/odycrim', methods=['POST'])
def odycrim():
    return jsonify(fetch_rows('odycrim', request.json))

@main.route('/api/odytraf', methods=['POST'])
def odytraf():
    return jsonify(fetch_rows('odytraf', request.json))
