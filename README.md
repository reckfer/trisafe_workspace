# trisafe_workspace
Guia para configurar:


React-Native:

Baixar as dependencias para navegação entre telas:
	npm install @react-navigation/native --save
	npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view
	npm install @react-navigation/stack --save

Baixar as dependencias para elementos de contrução de telas:
	=> npm install react-native-elements --force --save
	
Baixar as dependencias para rotina de armazenamento local:
	=> npm install @react-native-community/async-storage --save
	
Baixar as dependencias para ícones:
	=> npm install react-native-vector-icons --save
		Obs.: apenas a primeira vez, foi necessário adicionar o seguinte, ao arquivo C:\Users\ferna\trisafe_workspace\trisafeapp\android\app\build.gradle:
			// Adiciona as fontes de icones.
			apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"

Baixar as dependencias para rotina de armazenamento local:
	=> npm install @react-native-community/async-storage --save
	
Baixar as dependencias para notificações:
	=> npm install react-native-push-notification --save
	
Baixar as dependencias para cartões de escolhas:
	=> npm install react-native-cards --save
	
	
Python

	=> pip install django
	=> pip install djangorestframework
	=> pip install markdown
	=> pip install django-filter
	=> pip install python-decouple
	=> pip install dj-database-url
	=> pip install requests
	=> pip install gerencianet
	=> pip install fpdf

	Criar as definições de banco de dados:
	=> python manage.py makemigrations
	=> python manage.py migrate