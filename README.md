# Manual do desenvolvedor da trisafe_workspace

Guia para o desenvolvedor configurar a workspace na estação de trabalho, apenas a primeira vez:

# Prerequisitos

Os seguintes pacotes devem estar instalados na estação de trabalho.

- Python 3.5.1 ou superior (ver instruções de instalação no site)
- React-Native: seguir instruções de instalação no site do React Native, https://reactnative.dev/docs/environment-setup, aba "React Native CLI Quickstart"
- Emulador Android
- Android Studio
- Visual Studio Code
- Git

# React-Native

## Baixar todas as dependencias de pacotes React-Native utilizados:

Acessar a pasta do projeto do aplicativo:

	cd trisafe_workspace\trisafeapp

Instalar as dependências:

	npm install
	
# Python:

## Criar o Virtual Environment do Python
Acessar a raiz da workspace.

	cd trisafe_workspace

No terminal cmd Windows:

	python.exe -m venv .venv
	.venv\Scripts\Activate.bat

No shell Linux/Mac:

	python.exe -m venv .venv	
	source .venv/bin/activate

## Instalar as dependências
	
	pip install django
	
	pip install djangorestframework
	
	pip install markdown
	
	pip install django-filter
	
	pip install python-decouple
	
	pip install dj-database-url
	
	pip install requests
	
	pip install gerencianet
	
	pip install fpdf

## Criar as definições de banco de dados:

	python manage.py makemigrations
	
	python manage.py migrate
	
	python manage.py createsuperuser

# No Visual Studio Code
	
	Acessar o menu Run -> Add Configuration. Dentro de args, adicionar o ip:porta
