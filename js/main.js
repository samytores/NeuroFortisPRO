document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navList.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navList.classList.remove('active');
        });
    });
    
    // Testimonial Slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    
    if (slides.length > 0) {
        // Function to show a specific slide
        function showSlide(n) {
            // Hide all slides
            slides.forEach(slide => {
                slide.style.display = 'none';
            });
            
            // Calculate the slide index
            currentSlide = (n + slides.length) % slides.length;
            
            // Show the current slide
            slides[currentSlide].style.display = 'block';
        }
        
        // Initialize the slider
        showSlide(currentSlide);
        
        // Previous button click handler
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showSlide(currentSlide - 1);
            });
        }
        
        // Next button click handler
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showSlide(currentSlide + 1);
            });
        }
        
        // Auto-rotate slides every 5 seconds
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // If the clicked item wasn't active, make it active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get the fixed header height
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Highlight active nav item based on scroll position
    function highlightNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let scrollPosition = window.scrollY + 200; // Offset to trigger highlight a bit earlier
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - document.querySelector('.header').offsetHeight;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    
                    if (link.getAttribute('href') === `#${sectionId}` || 
                        (sectionId === 'blog-preview' && link.getAttribute('href') === 'blog/index.html')) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Check if we're at the top of the page
        if (scrollPosition < 150) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === 'index.html') {
                    link.classList.add('active');
                }
            });
        }
    }
    
    window.addEventListener('scroll', highlightNavOnScroll);
    
    // Trigger once on page load
    highlightNavOnScroll();
    
    // Animated entrance for benefits cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    
    function checkBenefitCards() {
        benefitCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight * 0.8) {
                card.classList.add('animate-in');
            }
        });
    }
    
    // Add animation class to CSS
    const styleSheet = document.styleSheets[0];
    const animationRule = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .benefit-card {
            opacity: 0;
        }
        
        .benefit-card.animate-in {
            animation: fadeInUp 0.5s forwards;
        }
    `;
    
    // Add the animation rules to the stylesheet
    if (styleSheet.insertRule) {
        styleSheet.insertRule(animationRule, styleSheet.cssRules.length);
    } else if (styleSheet.addRule) {
        styleSheet.addRule(animationRule, -1);
    }
    
    window.addEventListener('scroll', checkBenefitCards);
    window.addEventListener('load', checkBenefitCards);
    
    // Add delay to each card for staggered animation
    benefitCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});
