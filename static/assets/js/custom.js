// jQuery Effect
function effect(text) {
    $('#messages')
        .append('<pre>' + text + '</pre>')
        .children()
        .removeClass('new')
        .last()
        .hide()
        .addClass('new')
        .fadeIn(1000);
}

// Async request
const ask = document.querySelector('#ask');
$(function () {
    $('#submit').on('click', () => {
        effect(ask.value);
        let data = ask.value;
        ask.value = '';
        fetch('/chat', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(text => {
                effect(text)
            });
    });

    // get one archive
    const archiveContentHtml = (role, time, message) => `
            <small><img src="/static/assets/icon/${role}" width="16"> at ${time}</small>
            <pre style="display:block;">${message}</pre>
            <hr class="hr-blurry">
        `
    $('body').on('click', '.dropdown-item', function () {
        let date = $(this).text();
        fetch('/archive?date=' + date)
            .then(response => response.json())
            .then(json => {
                $('#title').text(date);
                $('#archive-content').empty()
                json.forEach((msg) => {
                    let role = msg['role'] + '.svg';
                    let time = msg['time'];
                    let message = msg['message'];
                    $('#archive-content').append(archiveContentHtml(role, time, message));
                })
            });
    });
});

// get all archives
const get_archives = () => {
    const archiveTitleHtml = date => `<a class="dropdown-item" data-toggle="modal" data-target="#archive">${date}</a>`;
    fetch('/archives')
        .then(response => response.json())
        .then(json => {
            if (json.length === 0) {
                $('#archives')
                    .empty()
                    .append('<span class="dropdown-item">no data</span>');
            } else {
                $('#archives').empty();
                json.forEach((date) => {
                    $('#archives').append(archiveTitleHtml(date));
                });
            }
        });
}

$('.dropdown-toggle').on('click', () => {
    get_archives();
})

get_archives();