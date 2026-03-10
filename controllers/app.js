// Controller: Carrega dados e popula a view
document.addEventListener('DOMContentLoaded', () => {
    fetch('models/profile.json')
        .then(response => response.json())
        .then(data => {
            // Hero
            document.querySelector('.hero h1').textContent = data.name;
            document.querySelector('.hero p').textContent = data.title;

            // About
            document.querySelector('#about p').textContent = data.about;

            // Education
            const educationContainer = document.querySelector('#education .row');
            data.education.forEach(item => {
                const card = `
                    <div class="col-md-4">
                        <div class="card">
                            <img src="${item.image}" class="card-img-top" alt="${item.title}">
                            <div class="card-body">
                                <h5>${item.title}</h5>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    </div>
                `;
                educationContainer.insertAdjacentHTML('beforeend', card);
            });

            // Projects
            const projectsContainer = document.querySelector('#projects .row');
            data.projects.forEach(item => {
                const card = `
                    <div class="col-md-4">
                        <div class="card">
                            <img src="${item.image}" class="card-img-top" alt="${item.title}">
                            <div class="card-body">
                                <h5>${item.title}</h5>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    </div>
                `;
                projectsContainer.insertAdjacentHTML('beforeend', card);
            });

            // Testimonials
            const testimonialsContainer = document.querySelector('#testimonials');
            data.testimonials.forEach(item => {
                const quote = `
                    <blockquote class="blockquote">
                        <p>"${item.text}"</p>
                        <footer class="blockquote-footer">${item.author} <cite title="Source Title">${item.source}</cite></footer>
                    </blockquote>
                `;
                testimonialsContainer.insertAdjacentHTML('beforeend', quote);
            });

            // Courses
            const coursesContainer = document.querySelector('#courses .row');
            data.courses.forEach(item => {
                const card = `
                    <div class="col-md-6">
                        <div class="card">
                            <img src="${item.image}" class="card-img-top" alt="${item.title}">
                            <div class="card-body">
                                <h5>${item.title}</h5>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    </div>
                `;
                coursesContainer.insertAdjacentHTML('beforeend', card);
            });

            // Footer
            const footer = document.querySelector('footer .container p');
            footer.innerHTML = `Me mande um email: <a href="mailto:${data.contact.email}">${data.contact.email}</a><br>
            <a href="${data.contact.linkedin}" class="me-3">LinkedIn</a>
            <a href="${data.contact.medium}">Medium</a>`;
        })
        .catch(error => console.error('Erro ao carregar dados:', error));
});