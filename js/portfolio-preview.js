document.addEventListener("DOMContentLoaded", () => {
    fetch("api/get-random-portfolio.php")
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById("portfolioGrid");
            grid.innerHTML = "";

            data.forEach(item => {
                const el = document.createElement("div");
                el.className = "portfolio-item reveal";

                if (item.type === "image") {
                    el.innerHTML = `
                        <div class="portfolio-placeholder"
                            style="background-image:url('${item.path}')">
                            <div class="portfolio-overlay">
                                <span>Voir le projet</span>
                            </div>
                        </div>
                    `;
                } else {
                    el.innerHTML = `
                        <div class="portfolio-placeholder video">
                            <video src="${item.path}" muted loop></video>
                            <div class="portfolio-overlay">
                                <span>Voir la vidéo</span>
                            </div>
                        </div>
                    `;
                }

                grid.appendChild(el);
            });

            animateReveal();
        });
});

function animateReveal() {
    const items = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.2 });

    items.forEach(i => observer.observe(i));
}
