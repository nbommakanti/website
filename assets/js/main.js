// Load shared header and footer components
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
});

// Load header component
function loadHeader() {
    const headerHTML = `
        <header id="header" class="bg-white sticky top-0 z-50 shadow-sm">
            <div class="container mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <!-- Logo -->
                    <a href="index.html" class="text-2xl font-bold text-blue-900 flex items-center">
                        <svg class="w-8 h-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Nikhil Bommakanti, M.D.
                    </a>

                    <!-- Desktop Navigation -->
                    <nav class="hidden md:flex items-center space-x-8">
                        <a href="index.html" class="nav-link text-gray-600 hover:text-blue-600 transition duration-300" data-page="home">Home</a>
                        <a href="about.html" class="nav-link text-gray-600 hover:text-blue-600 transition duration-300" data-page="about">About</a>
                        <a href="conditions.html" class="nav-link text-gray-600 hover:text-blue-600 transition duration-300" data-page="conditions">Conditions</a>
                        <a href="publications.html" class="nav-link text-gray-600 hover:text-blue-600 transition duration-300" data-page="publications">Publications</a>
                    </nav>

                    <!-- Mobile Menu Button -->
                    <button id="mobile-menu-button" class="md:hidden focus:outline-none">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden md:hidden px-6 pb-4 bg-white">
                <a href="index.html" class="nav-link block py-2 text-gray-600 hover:text-blue-600" data-page="home">Home</a>
                <a href="about.html" class="nav-link block py-2 text-gray-600 hover:text-blue-600" data-page="about">About</a>
                <a href="conditions.html" class="nav-link block py-2 text-gray-600 hover:text-blue-600" data-page="conditions">Conditions</a>
                <a href="publications.html" class="nav-link block py-2 text-gray-600 hover:text-blue-600" data-page="publications">Publications</a>
            </div>
        </header>
    `;
    
    document.getElementById('header-container').innerHTML = headerHTML;
    
    // Set active navigation state
    setActiveNavigation();
    
    // Initialize mobile menu functionality
    initializeMobileMenu();
}

// Load footer component
function loadFooter() {
    const footerHTML = `
        <footer class="bg-blue-900 text-white">
            <div class="container mx-auto px-6 py-12">
                <div class="grid md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-xl font-bold mb-4">Dr. Nikhil Bommakanti</h3>
                        <p class="text-blue-200">Dedicated to preserving and restoring sight.</p>
                    </div>
                </div>
                <div class="mt-12 border-t border-blue-800 pt-8 text-center text-blue-300">
                    <p>&copy; <span id="current-year"></span> Dr. Nikhil Bommakanti. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    `;
    
    document.getElementById('footer-container').innerHTML = footerHTML;
    
    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

// Set active navigation state based on current page
function setActiveNavigation() {
    const activePage = window.activePage || 'home';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.dataset.page === activePage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Contact form functionality (for when contact page is added)
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            formStatus.className = 'text-blue-600';

            setTimeout(() => {
                formStatus.textContent = 'Thank you for your message! We will get back to you shortly.';
                formStatus.className = 'text-green-600 p-3 bg-green-100 rounded-md';
                contactForm.reset();
            }, 1500);
        });
    }
}

// Initialize contact form if it exists on the page
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is fully loaded
    setTimeout(initializeContactForm, 100);
});