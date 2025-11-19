run: run-android run-ios

run-android:
	cd my-app && npx react-native run-android

run-ios:
	cd my-app && npx react-native run-ios -- --simulator='iPhone 17 Pro'

server:
	. thegame/Scripts/activate && python manage.py runserver