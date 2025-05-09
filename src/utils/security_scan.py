#!/usr/bin/env python3
import os
import re
import sys
import ast
import importlib.util

def scan_file_for_vulnerabilities(file_path):
    """Scannt eine Datei auf potenzielle Sicherheitslücken"""
    vulnerabilities = []
    
    # Datei ignorieren, wenn sie nicht existiert oder keine Python-Datei ist
    if not os.path.exists(file_path) or not file_path.endswith('.py'):
        return vulnerabilities
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # 1. Suche nach gefährlichen Imports
        dangerous_imports = [
            'os.system', 'subprocess', 'eval', 'exec', 
            'pickle.load', 'yaml.load', 'tempfile.mktemp'
        ]
        
        for imp in dangerous_imports:
            if imp in content:
                vulnerabilities.append(f"Potenziell gefährlicher Import/Funktion gefunden: {imp}. Bitte prüfen und ersetzen Sie es durch eine sicherere Alternative.")
        
        # 2. Suche nach harten Codierungen von Secrets
        secret_patterns = [
            r'api[-_]?key\s*=\s*["\'][^"\']+["\']',
            r'password\s*=\s*["\'][^"\']+["\']',
            r'secret\s*=\s*["\'][^"\']+["\']',
            r'token\s*=\s*["\'][^"\']+["\']'
        ]
        
        for pattern in secret_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                vulnerabilities.append(f"Mögliches hartcodiertes Secret gefunden: {match.group(0)}")
        
        # 3. Suche nach SQL-Injection
        if 'execute(' in content and '%' in content:
            vulnerabilities.append("Mögliche SQL-Injection gefunden (String-Formatierung bei SQL-Anfragen). Verwenden Sie stattdessen parametrisierte Abfragen.")
        
        # 4. Suche nach unsicherer Pfadverarbeitung
        if '../' in content or '..' + os.sep in content:
            vulnerabilities.append("Mögliche unsichere Pfadverarbeitung gefunden (Directory Traversal). Validieren Sie die Eingaben und verwenden Sie sichere Pfadoperationen.")
        
        # 5. Prüfe auf fehlendes Exception-Handling
        if 'try:' not in content and ('open(' in content or 'import' in content):
            vulnerabilities.append("Fehlendes Exception-Handling bei Dateioperationen oder Imports")
        
        # 6. AST-basierte Analyse für komplexere Probleme
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                # Prüfe auf unsichere eval() Verwendung
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                    if node.func.id == 'eval' and len(node.args) > 0:
                        vulnerabilities.append("Unsichere Verwendung von eval() gefunden")
        except SyntaxError:
            vulnerabilities.append("Syntaxfehler beim Parsen des Codes - Datei konnte nicht vollständig analysiert werden")
            
    except Exception as e:
        vulnerabilities.append(f"Fehler beim Scannen der Datei: {str(e)}")
    
    return vulnerabilities

def scan_directory(directory):
    """Scannt ein Verzeichnis rekursiv nach Python-Dateien und prüft auf Sicherheitslücken"""
    results = {}
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                vulnerabilities = scan_file_for_vulnerabilities(file_path)
                
                if vulnerabilities:
                    rel_path = os.path.relpath(file_path, directory)
                    results[rel_path] = vulnerabilities
    
    return results

def check_dependencies():
    """Überprüft installierte Abhängigkeiten auf bekannte Sicherheitslücken"""
    # Einfache Implementierung - in der Praxis würde hier eine Verbindung
    # zu einer Sicherheitsdatenbank wie safety-db hergestellt werden
    
    vulnerable_packages = {
        'flask': ['<0.12.3', 'Anfällig für Session Cookie Hijacking'],
        'django': ['<2.2.18', 'Mehrere Sicherheitslücken'],
        'pillow': ['<6.2.2', 'Mehrere Sicherheitslücken bei der Bildverarbeitung'],
        'tensorflow': ['<2.4.0', 'Code-Ausführung durch bösartige Modelle'],
        'pytorch': ['<1.6.0', 'Mehrere Sicherheitslücken']
    }
    
    results = []
    
    for package, (vulnerable_version, description) in vulnerable_packages.items():
        spec = importlib.util.find_spec(package)
        if spec is not None:
            try:
                module = importlib.import_module(package)
                version = getattr(module, '__version__', 'Unbekannte Version')
                # Hier wäre eine richtige Versionsvergleichslogik nötig
                results.append(f"Paket {package} in Version {version} installiert. "
                              f"Versionen {vulnerable_version} sind anfällig für: {description}")
            except ImportError:
                pass
    
    return results

def main():
    """Hauptfunktion zur Ausführung des Sicherheitsscans"""
    if len(sys.argv) < 2:
        print("Verwendung: python security_scan.py [Verzeichnispfad]")
        return
    
    directory = sys.argv[1]
    
    if not os.path.exists(directory):
        print(f"Fehler: Das Verzeichnis {directory} existiert nicht.")
        return
    
    print(f"Starte Sicherheitsscan für: {directory}\n")
    
    # Abhängigkeiten prüfen
    print("Überprüfe Abhängigkeiten...")
    dependency_issues = check_dependencies()
    if dependency_issues:
        print("\nMögliche Sicherheitsprobleme in Abhängigkeiten gefunden:")
        for issue in dependency_issues:
            print(f"- {issue}")
    else:
        print("Keine bekannten Sicherheitsprobleme in den Abhängigkeiten gefunden.")
    
    # Code-Scan
    print("\nScanne Codebasis...")
    results = scan_directory(directory)
    
    if results:
        print("\nPotentielle Sicherheitslücken wurden gefunden:")
        for file_path, vulnerabilities in results.items():
            print(f"\n{file_path}:")
            for vuln in vulnerabilities:
                print(f"- {vuln}")
    else:
        print("Keine offensichtlichen Sicherheitslücken im Code gefunden.")
    
    print("\nSicherheitsscan abgeschlossen.")

if __name__ == "__main__":
    main()
