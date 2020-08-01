import cryptography
from cryptography.fernet import Fernet
import base64
import encodings
import os
import sys
import subprocess

PROD = 'P'
DESENV = 'D'
ind_debug = "DEBUG = True"
secret_key_django_app = '4coujo21&xdamy+in7!lwakm%@u*-%jz_ou4qgbqe1)zktrkqz'

ambiente = DESENV

def _instalar_pacotes():
    resultado_sucesso = True
    pacotes_necessarios = [
    'Django==2.2.14', 
    'django-filter==2.3.0', 
    'django-wsgi==1.0b1', 
    'djangorestframework==3.11.0', 
    'flup==1.0.3', 
    'certifi==2020.6.20', 
    'dj-database-url==0.5.0',     
    'fpdf==1.7.2', 
    'gerencianet==1.1.0', 
    'gunicorn==20.0.4', 
    'idna==2.10', 
    'importlib-metadata==1.7.0', 
    'Markdown==3.2.2', 
    'mysqlclient==1.4.6', 
    'pycparser==2.20', 
    'python-decouple==3.3',
    'pytz==2020.1', 
    'requests==2.9.1', 
    'six==1.9.0', 
    'sqlparse==0.3.1', 
    'urllib3==1.25.9', 
    'WebOb==1.8.6', 
    'zipp==1.2.0']

    retorno_run = subprocess.run(["pip", "freeze"], stdout=subprocess.PIPE, text=True)
    print('Pacotes instalados: %s%s' %('\n', retorno_run.stdout))
    
    if(retorno_run.stdout):
        pacotes_instalados = retorno_run.stdout.splitlines()
    else:
        pacotes_instalados = []

    ind_pacote_instalado = False
    
    for pacote_necessario in pacotes_necessarios:
        
        ind_pacote_instalado = False
        for pacote_instalado in pacotes_instalados:
            if(pacote_necessario.lower() == pacote_instalado.lower()):
                ind_pacote_instalado = True
                break
        
        if(not ind_pacote_instalado):
            print('Instalando o pacote %s ...' %pacote_necessario)
            retorno = os.system('pip install %s' %pacote_necessario)

            if retorno == 0:
                print('Pacote %s instalado com sucesso' %pacote_necessario)
            else:
                resultado_sucesso = False
                print('Erro ao instalar o pacote %s, retorno = %s' %(pacote_necessario, retorno))
    
    return resultado_sucesso

if (sys.argv and len(sys.argv) > 1):
    if(sys.argv[1].upper() == 'P'):
        ambiente = PROD

chave_iter_d1 = 'bUZk1V9YjNFjYQWD' # Usada no app.
chave_iter_d2 = 'jloWTdV25tHI1dzO'
credenciais_d = u'documentacao@iter.sc:documentacao123'

chave_iter_p1 = 'YjNQWDFjYk1VbUZ9' # Usada no app.
chave_iter_p2 = 'V25tdjloWTdzOHI1'
credenciais_p = u'financeiro@trisafe.com.br:4!ciZSC&'

credenciais = credenciais_d
chave_iter = chave_iter_d1 + chave_iter_d2
chave_iter2 = chave_iter_d2

if(ambiente == PROD):
    credenciais = credenciais_p
    chave_iter = chave_iter_p1 + chave_iter_p2
    chave_iter2 = chave_iter_p2
    ind_debug = "DEBUG = False"

chave_b64 = base64.b64encode(credenciais.encode())

chaveb64 = base64.b64encode(chave_iter.encode())

f = Fernet(chaveb64)

senha_cripto = f.encrypt(chave_b64)

decrypted = f.decrypt(senha_cripto)

linhas = []
linhas.append("SECRET_KEY = '" + secret_key_django_app + "'")
linhas.append(os.linesep)
linhas.append("CHAVE_ITER = '" + chave_iter2 + "'")
linhas.append(os.linesep)
linhas.append(ind_debug)

file = open('.env', 'w')
file.writelines(linhas)
file.close()
print("Criou arquivo de configuração geral .env")

file = open('.env_cred_iter', 'wb')
file.write(senha_cripto)
file.close()
print("Criou arquivo de credenciais da Iter criptografadas .env_cred_iter")

if _instalar_pacotes():
    print('Finalizou com sucesso.')
else:
    print('Finalizou com erros.')