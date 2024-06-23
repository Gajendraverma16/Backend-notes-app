document.getElementById('icon-1').addEventListener('click', function() {
    document.body.classList.add('theme-black');
    document.body.classList.remove('theme-white');
});

document.getElementById('icon-2').addEventListener('click', function() {
    document.body.classList.add('theme-white');
    document.body.classList.remove('theme-black');
});