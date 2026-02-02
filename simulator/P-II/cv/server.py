#!/usr/bin/env python3 -u

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import base64
import os
from pathlib import Path
import cv2
import numpy
from Pill import Pill
import json
import setproctitle

setproctitle.setproctitle('P-II.camera')


def imageProcess(rawImage):
    
    if rawImage is None:
        return
    
    # create numpy array with data from raw image
    numpy_image = numpy.frombuffer(rawImage, numpy.uint8)
    if numpy_image is None:
        return
    
    img = cv2.imdecode(numpy_image, cv2.IMREAD_COLOR)
    if img is None:
        return
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray,(11, 11),0)
    _, thresh1 = cv2.threshold(blur,48,255,cv2.THRESH_BINARY)

    erosionFactor = 10;

    erosion = cv2.erode(thresh1,numpy.ones((erosionFactor, erosionFactor),numpy.uint8),iterations = 1)
    blur = cv2.GaussianBlur(erosion,(9, 9),0)
    _, thresh2 = cv2.threshold(blur,68,255,cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    data = []
    for cnt in contours :

        data.append(Pill(cnt, img, erosionFactor).toObj())
    return data
    

class ImageHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Définit les en-têtes CORS pour autoriser les requêtes cross-origin"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def do_OPTIONS(self):
        """Gère les requêtes preflight CORS"""
        self.send_response(200)
        self._set_cors_headers()
        self.send_header('Content-Length', '0')
        self.end_headers()
    
    def do_POST(self):
        """Gère les requêtes POST pour recevoir les images"""
        if self.path == '/upload':
            try:
                # Lire la longueur du contenu
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Décoder les données JSON
                data = json.loads(post_data.decode('utf-8'))
                
                # Extraire le nom de fichier et l'image en base64
                filename = data.get('filename', 'image.png')
                image_base64 = data.get('image')
                
                if not image_base64:
                    self.send_response(400)
                    self._set_cors_headers()
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    error_response = {'status': 'error', 'message': 'Aucune image fournie'}
                    self.wfile.write(json.dumps(error_response).encode('utf-8'))
                    return
                
                # Décoder l'image base64
                image_data = base64.b64decode(image_base64)
                

                contoursData = imageProcess(image_data)

                # Créer le dossier uploads s'il n'existe pas
                upload_dir = Path('uploads')
                upload_dir.mkdir(exist_ok=True)
                
                # Sauvegarder l'image
                filepath = upload_dir / filename
                with open(filepath, 'wb') as f:
                    f.write(image_data)
                
                # Envoyer une réponse de succès
                self.send_response(200)
                self._set_cors_headers()
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    'status': 'success',
                    'message': f'Image enregistrée: {filepath}',
                    'data': contoursData
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
                #print(f"✓ Image enregistrée: {filepath}")
                
            except Exception as e:
                self.send_response(500)
                self._set_cors_headers()
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {'status': 'error', 'message': str(e)}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
                print(f"✗ Erreur: {e}")
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {'status': 'error', 'message': 'Endpoint non trouvé'}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_GET(self):
        """Gère les requêtes GET pour afficher des informations"""
        if self.path == '/':
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            html = """
            <html>
            <head><title>Serveur d'upload d'images</title></head>
            <body>
                <h1>Serveur d'upload d'images PNG</h1>
                <p>Pour envoyer une image, faites une requête POST à /upload</p>
                <p>Format JSON attendu:</p>
                <pre>{
    "filename": "mon_image.png",
    "image": "base64_encoded_data_here"
}</pre>
            </body>
            </html>
            """
            self.wfile.write(html.encode('utf-8'))
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()
    
    def log_message(self, format, *args):
        """Surcharge pour afficher les logs de manière plus lisible"""
        #print(f"[{self.log_date_time_string()}] {format % args}")

def run_server(port=8000):
    """Démarre le serveur HTTP"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, ImageHandler)
    print(f"🚀 Serveur démarré sur http://localhost:{port}")
    print(f"📁 Les images seront enregistrées dans le dossier 'uploads/'")
    print(f"🌐 CORS activé - Requêtes cross-origin autorisées")
    print("Pour arrêter le serveur, appuyez sur Ctrl+C\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹️  Serveur arrêté")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()