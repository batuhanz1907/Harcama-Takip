// Harcama Takip Uygulaması - Ana JavaScript Dosyası

// Uygulama durumu
let expenses = [];
let currentSort = 'newest';
let expenseToDelete = null;

// DOM Elementleri
const expenseForm = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const totalAmountElement = document.getElementById('totalAmount');
const expenseListElement = document.getElementById('expenseList');
const sortBySelect = document.getElementById('sortBy');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');
const listTotalElement = document.getElementById('listTotal');
const listAverageElement = document.getElementById('listAverage');
const listCountElement = document.getElementById('listCount');
const categorySummaryElement = document.getElementById('categorySummary');
const charCountElement = document.querySelector('.char-count');
const confirmModal = document.getElementById('confirmModal');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

// Uygulama başlangıcı
document.addEventListener('DOMContentLoaded', initApp);

// Uygulamayı başlat
function initApp() {
    // Bugünün tarihini varsayılan olarak ayarla
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
    
    // LocalStorage'dan verileri yükle
    loadExpenses();
    
    // Olay dinleyicilerini ekle
    setupEventListeners();
    
    // Açıklama karakter sayacını güncelle
    updateCharCount();
    
    // Harcamaları render et
    renderExpenses();
    
    // İstatistikleri güncelle
    updateStatistics();
}

// Olay dinleyicilerini kur
function setupEventListeners() {
    // Form gönderimi
    expenseForm.addEventListener('submit', handleAddExpense);
    
    // Sıralama değişikliği
    sortBySelect.addEventListener('change', handleSortChange);
    
    // Açıklama karakter sayımı
    descriptionInput.addEventListener('input', updateCharCount);
    
    // Tümünü temizle butonu
    clearAllBtn.addEventListener('click', handleClearAll);
    
    // Dışa aktar butonu
    exportBtn.addEventListener('click', handleExport);
    
    // Modal butonları
    modalCancel.addEventListener('click', closeModal);
    modalConfirm.addEventListener('click', confirmDelete);
    
    // Modal dışına tıklama
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            closeModal();
        }
    });
}

// Harcama ekleme işlemi
function handleAddExpense(e) {
    e.preventDefault();
    
    // Form verilerini al
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const date = dateInput.value;
    
    // Form doğrulama
    if (!validateForm(description, amount, category, date)) {
        return;
    }
    
    // Yeni harcama objesi oluştur
    const newExpense = {
        id: Date.now(),
        description,
        amount,
        category,
        date
    };
    
    // Harcamalar dizisine ekle
    expenses.push(newExpense);
    
    // LocalStorage'a kaydet
    saveExpenses();
    
    // Harcamaları render et
    renderExpenses();
    
    // İstatistikleri güncelle
    updateStatistics();
    
    // Formu temizle
    clearForm();
    
    // Başarılı mesajı göster
    showToast('Harcama başarıyla eklendi!', 'success');
}

// Form doğrulama
function validateForm(description, amount, category, date) {
    if (!description) {
        showToast('Lütfen harcama açıklaması giriniz.', 'error');
        descriptionInput.focus();
        return false;
    }
    
    if (!amount || amount <= 0) {
        showToast('Lütfen geçerli bir tutar giriniz.', 'error');
        amountInput.focus();
        return false;
    }
    
    if (!category) {
        showToast('Lütfen bir kategori seçiniz.', 'error');
        categorySelect.focus();
        return false;
    }
    
    if (!date) {
        showToast('Lütfen bir tarih seçiniz.', 'error');
        dateInput.focus();
        return false;
    }
    
    return true;
}

// Harcamaları LocalStorage'dan yükle
function loadExpenses() {
    try {
        const storedExpenses = localStorage.getItem('expenseTrackerData');
        if (storedExpenses) {
            expenses = JSON.parse(storedExpenses);
        }
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        expenses = [];
    }
}

// Harcamaları LocalStorage'a kaydet
function saveExpenses() {
    try {
        localStorage.setItem('expenseTrackerData', JSON.stringify(expenses));
    } catch (error) {
        console.error('Veri kaydetme hatası:', error);
        showToast('Veri kaydedilirken bir hata oluştu.', 'error');
    }
}

// Harcamaları render et
function renderExpenses() {
    // Harcamaları sırala
    const sortedExpenses = sortExpenses(expenses, currentSort);
    
    if (sortedExpenses.length === 0) {
        expenseListElement.innerHTML = `
            <div class="empty-list">
                <i class="fas fa-receipt"></i>
                <h3>Henüz harcama eklenmedi</h3>
                <p>İlk harcamanızı ekleyerek başlayın!</p>
            </div>
        `;
        return;
    }
    
    // Harcama listesini oluştur
    expenseListElement.innerHTML = sortedExpenses.map(expense => `
        <div class="expense-item" data-id="${expense.id}">
            <div class="expense-description">${escapeHTML(expense.description)}</div>
            <div class="expense-category category-${expense.category.toLowerCase()}">
                ${expense.category}
            </div>
            <div class="expense-date">${formatDate(expense.date)}</div>
            <div class="expense-amount">${formatCurrency(expense.amount)}</div>
            <div class="expense-actions">
                <button onclick="deleteExpense(${expense.id})" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Harcamaları sırala
function sortExpenses(expenses, sortType) {
    const sorted = [...expenses];
    
    switch (sortType) {
        case 'newest':
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'highest':
            return sorted.sort((a, b) => b.amount - a.amount);
        case 'lowest':
            return sorted.sort((a, b) => a.amount - b.amount);
        default:
            return sorted;
    }
}

// Sıralama değişikliği işlemi
function handleSortChange(e) {
    currentSort = e.target.value;
    renderExpenses();
}

// Harcama silme
function deleteExpense(id) {
    expenseToDelete = id;
    modalMessage.textContent = 'Bu harcamayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.';
    openModal();
}

// Silme işlemini onayla
function confirmDelete() {
    if (expenseToDelete) {
        expenses = expenses.filter(expense => expense.id !== expenseToDelete);
        saveExpenses();
        renderExpenses();
        updateStatistics();
        showToast('Harcama başarıyla silindi.', 'success');
        closeModal();
        expenseToDelete = null;
    }
}

// Tümünü temizle işlemi
function handleClearAll() {
    if (expenses.length === 0) {
        showToast('Temizlenecek harcama bulunamadı.', 'info');
        return;
    }
    
    expenseToDelete = 'all';
    modalMessage.textContent = 'Tüm harcama geçmişinizi temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.';
    openModal();
}

// Dışa aktar işlemi
function handleExport() {
    if (expenses.length === 0) {
        showToast('Dışa aktarılacak veri bulunamadı.', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `harcamalar_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Harcamalar başarıyla dışa aktarıldı.', 'success');
}

// İstatistikleri güncelle
function updateStatistics() {
    // Toplam harcama
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmountElement.textContent = formatCurrency(total);
    listTotalElement.textContent = formatCurrency(total);
    
    // Ortalama harcama
    const average = expenses.length > 0 ? total / expenses.length : 0;
    listAverageElement.textContent = formatCurrency(average);
    
    // Harcama sayısı
    listCountElement.textContent = expenses.length;
    
    // Kategori dağılımını güncelle
    updateCategorySummary();
}

// Kategori özetini güncelle
function updateCategorySummary() {
    if (expenses.length === 0) {
        categorySummaryElement.innerHTML = '<div class="empty-summary">Henüz harcama eklenmedi</div>';
        return;
    }
    
    // Kategorilere göre grupla
    const categoryTotals = {};
    const categoryCounts = {};
    
    expenses.forEach(expense => {
        const { category, amount } = expense;
        
        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
            categoryCounts[category] = 0;
        }
        
        categoryTotals[category] += amount;
        categoryCounts[category] += 1;
    });
    
    // HTML oluştur
    const categories = ['Gıda', 'Ulaşım', 'Eğlence', 'Fatura', 'Diğer'];
    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    
    categorySummaryElement.innerHTML = categories.map(category => {
        const categoryTotal = categoryTotals[category] || 0;
        const categoryCount = categoryCounts[category] || 0;
        const percentage = total > 0 ? (categoryTotal / total * 100).toFixed(1) : 0;
        
        return `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-color color-${category.toLowerCase()}"></div>
                    <span class="category-name">${category}</span>
                </div>
                <div class="category-stats">
                    ${formatCurrency(categoryTotal)} (${percentage}%)
                    <small>${categoryCount} harcama</small>
                </div>
            </div>
        `;
    }).join('');
}

// Formu temizle
function clearForm() {
    expenseForm.reset();
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    updateCharCount();
    descriptionInput.focus();
}

// Karakter sayacını güncelle
function updateCharCount() {
    const count = descriptionInput.value.length;
    charCountElement.textContent = `${count}/100`;
    
    if (count > 90) {
        charCountElement.style.color = 'var(--danger-color)';
    } else if (count > 70) {
        charCountElement.style.color = 'var(--warning-color)';
    } else {
        charCountElement.style.color = 'var(--medium-gray)';
    }
}

// Modal işlemleri
function openModal() {
    confirmModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    confirmModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    expenseToDelete = null;
}

// Yardımcı fonksiyonlar
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    // Toast container oluştur
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Toast elementi oluştur
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animasyon ekle
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Otomatik kaldır
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    // Kapatma butonu ekle
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.className = 'toast-close';
    closeBtn.onclick = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };
    
    toast.querySelector('.toast-content').appendChild(closeBtn);
}

// Toast stillerini dinamik olarak ekle
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .toast {
        background: white;
        border-radius: var(--radius-sm);
        padding: 1rem 1.5rem;
        box-shadow: var(--shadow-lg);
        min-width: 300px;
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        border-left: 4px solid;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast-success { border-left-color: var(--food-color); }
    .toast-error { border-left-color: var(--danger-color); }
    .toast-info { border-left-color: var(--info-color); }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .toast-content i {
        font-size: 1.25rem;
    }
    
    .toast-success .toast-content i { color: var(--food-color); }
    .toast-error .toast-content i { color: var(--danger-color); }
    .toast-info .toast-content i { color: var(--info-color); }
    
    .toast-content span {
        flex: 1;
        font-weight: 500;
    }
    
    .toast-close {
        background: none;
        border: none;
        color: var(--medium-gray);
        cursor: pointer;
        padding: 0.25rem;
        font-size: 0.875rem;
    }
    
    .toast-close:hover {
        color: var(--dark-gray);
    }
`;
document.head.appendChild(toastStyles);