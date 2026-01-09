/**
 * Kid to Kid Online - JavaScript v2.0
 * Funcionalidades do site
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // Catalogue Dropdown / Mega Menu
    // ============================================
    
    const catalogueDropdown = document.querySelector('.catalogue-dropdown');
    const catalogueBtn = document.getElementById('catalogueBtn');
    const megaMenu = document.querySelector('.mega-menu');
    const megaCategories = document.querySelectorAll('.mega-category');
    const subcategoryPanels = document.querySelectorAll('.mega-subcategory-panel');
    
    if (catalogueBtn) {
        // Toggle mega menu on click
        catalogueBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            catalogueDropdown.classList.toggle('active');
            
            // Activate first category by default
            if (catalogueDropdown.classList.contains('active') && megaCategories.length > 0) {
                activateCategory(megaCategories[0]);
            }
        });
        
        // Close mega menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!catalogueDropdown.contains(e.target)) {
                catalogueDropdown.classList.remove('active');
            }
        });
        
        // Close mega menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                catalogueDropdown.classList.remove('active');
            }
        });
    }
    
    // Category hover effect
    megaCategories.forEach(function(category) {
        category.addEventListener('mouseenter', function() {
            activateCategory(this);
        });
        
        category.addEventListener('click', function() {
            // Navigate to category page
            const categoryId = this.dataset.category;
            if (categoryId) {
                window.location.href = `/catalogo/${categoryId}`;
            }
        });
    });
    
    function activateCategory(category) {
        // Remove active from all categories
        megaCategories.forEach(c => c.classList.remove('active'));
        // Add active to current
        category.classList.add('active');
        
        // Show corresponding subcategory panel
        const categoryId = category.dataset.category;
        subcategoryPanels.forEach(panel => {
            if (panel.dataset.category === categoryId) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }
    
    // ============================================
    // Mobile Menu
    // ============================================
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // ============================================
    // Cart Functionality
    // ============================================
    
    const cartBadge = document.querySelector('.cart-badge');
    
    // Update cart badge
    function updateCartBadge(count) {
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Add to cart
    async function addToCart(productId, quantity = 1) {
        try {
            const response = await fetch('/api/carrinho/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });
            
            const data = await response.json();
            
            if (data.success) {
                updateCartBadge(data.totalItems);
                showNotification('Produto adicionado ao carrinho!', 'success');
            } else {
                showNotification(data.message || 'Erro ao adicionar ao carrinho', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Erro ao adicionar ao carrinho', 'error');
        }
    }
    
    // Remove from cart
    async function removeFromCart(productId) {
        try {
            const response = await fetch('/api/carrinho/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                updateCartBadge(data.totalItems);
                showNotification('Produto removido do carrinho', 'success');
                // Reload page if on cart page
                if (window.location.pathname.includes('/carrinho')) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            showNotification('Erro ao remover do carrinho', 'error');
        }
    }
    
    // Expose cart functions globally
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    
    // ============================================
    // Favorites Functionality
    // ============================================
    
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    
    favoriteButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.productId;
            const icon = this.querySelector('svg') || this.querySelector('i');
            
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                showNotification('Adicionado aos favoritos ❤️', 'success');
            } else {
                showNotification('Removido dos favoritos', 'info');
            }
        });
    });
    
    // ============================================
    // Notifications / Toast
    // ============================================
    
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add styles if not already in document
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification-toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    background: #333;
                    color: white;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .notification-success { background: #4caf50; }
                .notification-error { background: #f44336; }
                .notification-info { background: #2196f3; }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    opacity: 0.7;
                }
                .notification-close:hover { opacity: 1; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
    
    // Expose notification function globally
    window.showNotification = showNotification;
    
    // ============================================
    // Cookie Banner
    // ============================================
    
    const cookieBanner = document.querySelector('.cookie-banner');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    const declineCookiesBtn = document.getElementById('declineCookies');
    
    // Check if cookies were already accepted
    if (!localStorage.getItem('cookiesAccepted') && cookieBanner) {
        cookieBanner.classList.add('show');
    }
    
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.remove('show');
        });
    }
    
    if (declineCookiesBtn) {
        declineCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'false');
            cookieBanner.classList.remove('show');
        });
    }
    
    // ============================================
    // Search Functionality
    // ============================================
    
    const searchForms = document.querySelectorAll('.search-form');
    
    searchForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            const input = this.querySelector('.search-input');
            if (!input.value.trim()) {
                e.preventDefault();
                input.focus();
            }
        });
    });
    
    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // ============================================
    // Quantity Controls (for cart page)
    // ============================================
    
    const quantityControls = document.querySelectorAll('.quantity-control');
    
    quantityControls.forEach(function(control) {
        const minusBtn = control.querySelector('.qty-minus');
        const plusBtn = control.querySelector('.qty-plus');
        const input = control.querySelector('.qty-input');
        
        if (minusBtn) {
            minusBtn.addEventListener('click', function() {
                const currentVal = parseInt(input.value) || 1;
                if (currentVal > 1) {
                    input.value = currentVal - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }
        
        if (plusBtn) {
            plusBtn.addEventListener('click', function() {
                const currentVal = parseInt(input.value) || 1;
                const max = parseInt(input.max) || 10;
                if (currentVal < max) {
                    input.value = currentVal + 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }
    });
    
    // ============================================
    // Image Gallery (for product page)
    // ============================================
    
    const galleryThumbs = document.querySelectorAll('.gallery-thumb');
    const mainImage = document.querySelector('.main-image img');
    
    galleryThumbs.forEach(function(thumb) {
        thumb.addEventListener('click', function() {
            galleryThumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            if (mainImage) {
                mainImage.src = this.dataset.image;
            }
        });
    });
    
    // ============================================
    // Lazy Loading Images
    // ============================================
    
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }
    
    // ============================================
    // Form Validation
    // ============================================
    
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(function(field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Por favor preencha todos os campos obrigatórios', 'error');
            }
        });
    });
    
    // ============================================
    // Initialize
    // ============================================
    
    console.log('🧒 Kid to Kid Online v2.0 - Ready!');
});
