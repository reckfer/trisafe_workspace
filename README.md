# trisafe_workspace
Guia para configurar a workspace, apenas a primeira vez:

# React-Native:

## Baixar as dependencias para navegação entre telas:

	npm install @react-navigation/native --save
	
	npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view
	
	npm install @react-navigation/stack --save
	
	npm install @react-navigation/drawer --save

##Baixar as dependencias para elementos de construção de telas:

	npm install react-native-elements --save
	
##Baixar as dependencias para ícones:

	npm install react-native-vector-icons --save
	
		Obs.: apenas a primeira vez, foi necessário adicionar o seguinte, ao arquivo C:\Users\ferna\trisafe_workspace\trisafeapp\android\app\build.gradle:
		
			// Adiciona as fontes de icones.
			apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"

##Baixar as dependencias para cartões de escolhas:

	npm install react-native-cards --save

##Baixar as visualizador de PDF:	

	npm install react-native-pdf rn-fetch-blob --save
	
	npm install @react-native-community/progress-bar-android --save
	
		Obs.: apenas a primeira vez, foi necessário adicionar o seguinte, ao arquivo C:\Users\ferna\trisafe_workspace\trisafeapp\android\app\build.gradle:
		
			pickFirst "lib/x86_64/libjsc.so"
			
			pickFirst "lib/arm64-v8a/libjsc.so"
	
##Baixar as dependencias para rotina de armazenamento local:

	npm install @react-native-community/async-storage --save
	
##Baixar as dependencias para notificações:
	
	npm install react-native-push-notification --save

##Baixar as dependencias para logger:

	npm install react-native-logs --save
	
	
#Python:

Acessar o cmd:

Acessar a pasta: trisafe_workspace

	python.exe -m venv .venv

##On Windows, in cmd prompt

	.venv\Scripts\Activate.bat

##On Linux/Mac, in shell

	. .venv/bin/activate

	pip install django
	
	pip install djangorestframework
	
	pip install markdown
	
	pip install django-filter
	
	pip install python-decouple
	
	pip install dj-database-url
	
	pip install requests
	
	pip install gerencianet
	
	pip install fpdf

##Criar as definições de banco de dados:

	python manage.py makemigrations
	
	python manage.py migrate
	
	python manage.py createsuperuser

#No Visual Studio Cod
	
	Acessar o menu Run -> Add Configuration. Dentro de args, adicionar o ip:porta
