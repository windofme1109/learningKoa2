const logo = document.querySelector('.logo-img');

logo.addEventListener('mouseenter', function (e) {
    let target = e.target;
    if (!target.classList.contains('larger')) {
        target.classList.add('larger');
    }
})

logo.addEventListener('mouseleave', function (e) {
    let target = e.target;
    if (target.classList.contains('larger')) {
        target.classList.remove('larger');
    }
})