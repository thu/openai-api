import datetime
import json
import os.path

from flask import Flask, render_template, request
from openai import OpenAI

client = OpenAI(api_key='YOUR_API_KEY')

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return render_template('index.html')


@app.route('/chat', methods=['post'])
def chat_with_bot():
    content = request.get_json()
    save('mankind', content)
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": content},
        ]
    )
    reply = response.choices[0].message.content
    save('machine', reply)
    return reply


def save(role, message):
    date = datetime.date.today()
    time = datetime.datetime.now()
    dialog_dict = {'role': role, 'time': time.strftime('%X'), 'message': message}

    if not os.path.exists('data'):
        os.makedirs('data')
    file = 'data/' + date.strftime('%Y-%m-%d') + '.json'
    print(file)

    if not os.path.exists(file):
        with open(file, 'w') as f:
            data = [dialog_dict]
            json.dump(data, f, ensure_ascii=False)
    else:
        with open(file, 'r+') as f:
            data = json.load(f)
            data.append(dialog_dict)
            f.seek(0)
            json.dump(data, f, ensure_ascii=False)


@app.route('/archives', methods=['get'])
def get_archives():
    if not os.path.exists('data'):
        return []
    return [sub.split('.')[0] for sub in sorted(os.listdir('data'), reverse=True)]


@app.route('/archive', methods=['get'])
def get_archive():
    file = 'data/' + request.args.get('date') + '.json'
    print(file)
    with open(file, 'r') as f:
        data = json.load(f)
    return data


if __name__ == '__main__':
    app.run(debug=True)
