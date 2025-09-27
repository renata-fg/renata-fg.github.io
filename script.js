// Bar Chart Example
document.addEventListener('DOMContentLoaded', function () {
    var ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            datasets: [{
                label: 'Sign Ups',
                data: [12, 19, 4, 7, 3],
                backgroundColor: '#4285f4'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            }
        }
    });
});
