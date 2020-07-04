# Manual do desenvolvedor da trisafe_workspace

Guia para o desenvolvedor configurar a workspace na estação de trabalho, apenas a primeira vez:

# Prerequisitos

- Python 3.5.1 ou superior
- React-Native
- Emulador Android
- Android Studio
- Visual Studio Code
- Git

# React-Native

## Baixar as dependencias para navegação entre telas:

	npm install @react-navigation/native --save
	
	npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view
	
	npm install @react-navigation/stack --save
	
	npm install @react-navigation/drawer --save

## Baixar as dependencias para elementos de construção de telas:

	npm install react-native-elements --save
	
## Baixar as dependencias para ícones:

	npm install react-native-vector-icons --save
	
		Obs.: apenas a primeira vez, foi necessário adicionar o seguinte, ao arquivo C:\Users\ferna\trisafe_workspace\trisafeapp\android\app\build.gradle:
		
			// Adiciona as fontes de icones.
			apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"

## Baixar as dependencias para cartões de escolhas:

	npm install react-native-cards --save

## Baixar as visualizador de PDF:	

	npm install react-native-pdf rn-fetch-blob --save
	
	npm install @react-native-community/progress-bar-android --save
	
		Obs.: apenas a primeira vez, foi necessário adicionar o seguinte, ao arquivo C:\Users\ferna\trisafe_workspace\trisafeapp\android\app\build.gradle:
		
			pickFirst "lib/x86_64/libjsc.so"
			
			pickFirst "lib/arm64-v8a/libjsc.so"
	
## Baixar as dependencias para rotina de armazenamento local:

	npm install @react-native-community/async-storage --save
	
## Baixar as dependencias para notificações:
	
	npm install react-native-push-notification --save

## Baixar as dependencias para logger:

	npm install react-native-logs --save
	
	
# Python:

Acessar a raiz da workspace.

	cd trisafe_workspace

## Criar o Virtual Environment do Python
 - No terminal cmd Windows:
	
	python.exe -m venv .venv

	.venv\Scripts\Activate.bat

 - No shell Linux/Mac:

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
