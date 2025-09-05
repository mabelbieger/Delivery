class DeliveryApp {
    constructor() {
        this.backendBaseUrl = '../backend/api'; 
        this.currentSection = 'restaurants';
        this.data = {
            restaurants: [],
            foods: [],
            users: []
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCurrentSection();
    }

    bindEvents() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });

        document.getElementById('search-restaurants').addEventListener('input', (e) => {
            this.filterData('restaurants', e.target.value);
        });

        document.getElementById('search-foods').addEventListener('input', (e) => {
            this.filterData('foods', e.target.value);
        });

        document.getElementById('search-users').addEventListener('input', (e) => {
            this.filterData('users', e.target.value);
        });

        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) {
                this.closeModal();
            }
        });
    }

    switchSection(section) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        document.querySelectorAll('.section').forEach(sec => {
            sec.style.display = 'none';
        });

        document.getElementById(`${section}-section`).style.display = 'block';

        this.currentSection = section;
        this.loadCurrentSection();
    }

    async loadCurrentSection() {
        this.showLoading(true);
        this.hideError();

        try {
            const data = await this.fetchFromBackend(this.currentSection);
            this.data[this.currentSection] = data;
            this.renderData(this.currentSection, data);
            this.showLoading(false);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showError(`Erro ao carregar ${this.currentSection}`);
            this.showLoading(false);
        }
    }

    async fetchFromBackend(endpoint) {
        const response = await fetch(`${this.backendBaseUrl}/${endpoint}.php`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    renderData(section, data) {
        const grid = document.getElementById(`${section}-grid`);
        
        if (!data || data.length === 0) {
            grid.innerHTML = this.getEmptyState(section);
            return;
        }

        const cards = data.map(item => this.createCard(section, item)).join('');
        grid.innerHTML = cards;

        grid.querySelectorAll('.card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showItemDetails(section, data[index]);
            });
        });
    }

    createCard(section, item) {
        const icons = {
            restaurants: 'fas fa-store',
            foods: 'fas fa-hamburger',
            users: 'fas fa-user'
        };

        let title, description, badge, info;

        switch (section) {
            case 'restaurants':
                title = item.name || item.restaurant_name || 'Restaurant';
                description = item.description || item.cuisine || 'Delicious food';
                badge = item.category || item.type || 'Restaurant';
                info = item.rating ? `⭐ ${item.rating}` : '';
                break;
            case 'foods':
                title = item.name || item.food_name || 'Food Item';
                description = item.description || 'Tasty dish';
                badge = item.price ? `R$ ${item.price}` : item.category || 'Food';
                info = item.restaurant || '';
                break;
            case 'users':
                title = item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'User';
                description = item.email || item.username || '';
                badge = item.role || item.type || 'User';
                info = item.phone || item.created_at || '';
                break;
        }

        const hasImage = item.image || item.photo || item.avatar || item.picture;
        const imageUrl = hasImage ? (item.image || item.photo || item.avatar || item.picture) : null;

        return `
            <div class="card" data-id="${item.id}">
                <div class="card-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${this.escapeHtml(title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="fallback-icon" style="display:none; align-items:center; justify-content:center; width:100%; height:100%;">
                             <i class="${icons[section]}"></i>
                         </div>` 
                        : 
                        `<i class="${icons[section]}"></i>`
                    }
                </div>
                <div class="card-content">
                    <h3 class="card-title">${this.escapeHtml(title)}</h3>
                    <p class="card-description">${this.escapeHtml(description)}</p>
                    <div class="card-info">
                        <span class="card-badge">${this.escapeHtml(badge)}</span>
                        <span>${this.escapeHtml(info)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showItemDetails(section, item) {
        const modalBody = document.getElementById('modal-body');
        const title = this.getItemTitle(section, item);
        
        modalBody.innerHTML = `
            <div class="modal-header">
                <h3>${this.escapeHtml(title)}</h3>
            </div>
            <div class="modal-info">
                ${this.getItemInfo(section, item)}
            </div>
        `;

        document.getElementById('modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    getItemTitle(section, item) {
        switch (section) {
            case 'restaurants':
                return item.name || item.restaurant_name || 'Restaurant';
            case 'foods':
                return item.name || item.food_name || 'Food Item';
            case 'users':
                return item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'User';
            default:
                return 'Details';
        }
    }

    getItemInfo(section, item) {
        const info = [];

        Object.entries(item).forEach(([key, value]) => {
            if (value && key !== 'id') {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                info.push(`
                    <div class="info-item">
                        <span class="info-label">${this.escapeHtml(label)}:</span>
                        <span class="info-value">${this.escapeHtml(String(value))}</span>
                    </div>
                `);
            }
        });

        return info.join('');
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    filterData(section, query) {
        const data = this.data[section];
        if (!data) return;

        const filtered = data.filter(item => {
            const searchText = Object.values(item)
                .join(' ')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            
            const normalizedQuery = query
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            return searchText.includes(normalizedQuery);
        });

        this.renderData(section, filtered);
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = show ? 'none' : (section.id === `${this.currentSection}-section` ? 'block' : 'none');
        });
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error').style.display = 'block';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    getEmptyState(section) {
        const icons = {
            restaurants: 'fas fa-store',
            foods: 'fas fa-hamburger',
            users: 'fas fa-users'
        };

        const messages = {
            restaurants: 'Nenhum restaurante encontrado',
            foods: 'Nenhuma comida encontrada',
            users: 'Nenhum usuário encontrado'
        };

        return `
            <div class="empty-state">
                <i class="${icons[section]}"></i>
                <h3>${messages[section]}</h3>
                <p>Tente ajustar sua pesquisa ou tente novamente mais tarde.</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

function loadCurrentSection() {
    window.deliveryApp.loadCurrentSection();
}

document.addEventListener('DOMContentLoaded', () => {
    window.deliveryApp = new DeliveryApp();
});