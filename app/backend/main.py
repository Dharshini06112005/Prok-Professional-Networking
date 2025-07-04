from app.backend.app import get_app

if __name__ == '__main__':
    app = get_app()
    app.run(debug=True) 