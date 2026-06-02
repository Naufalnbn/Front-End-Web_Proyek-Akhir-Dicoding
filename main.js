/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = [];
let editId = null;

// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
function generateId() {
    return +new Date();
}

const STORAGE_KEY = "transactions";
const RENDER_EVENT = "transaction:updated";


/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");
const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("transactionFormTitleInput");
const amountInput = document.getElementById("transactionFormAmountInput");
const dateInput = document.getElementById("transactionFormDateInput");
const typeInput = document.getElementById("transactionFormTypeSelect");
const submitButton = document.querySelector('[data-testid="transactionFormSubmitButton"]');

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */
function renderTransactions(data = transactions){
    incomeList.innerHTML = "";
    expenseList.innerHTML = "";

    for (const transaction of data) {
        const card = document.createElement("div");
        card.setAttribute("data-testid", "transactionItem");

        const title = document.createElement("h3");
        title.setAttribute("data-testid", "transactionItemTitle");
        title.innerText = transaction.title;

        const amount = document.createElement("p");
        amount.setAttribute("data-testid", "transactionItemAmount");
        amount.innerText = "Nominal: Rp" + transaction.amount;

        const date = document.createElement("p");
        date.setAttribute("data-testid", "transactionItemDate");
        date.innerText = "Tanggal: " + transaction.date;

        const type = document.createElement("p");
        type.setAttribute("data-testid", "transactionItemType");

        if (transaction.type === "income") {
            type.innerText = "Tipe: Pemasukan";
        } else {
            type.innerText = "Tipe: Pengeluaran";
        }

        card.appendChild(title);
        card.appendChild(amount);
        card.appendChild(date);
        card.appendChild(type);

        const buttonContainer = document.createElement("div");

        const editButton = document.createElement("button");
        editButton.setAttribute("data-testid", "transactionItemEditButton");
        editButton.innerText = "Edit";
        editButton.addEventListener("click", function () {
            editTransaction(transaction.id);
        });

        const changeTypeButton = document.createElement("button");
        changeTypeButton.setAttribute("data-testid", "transactionItemEditTypeButton");
        changeTypeButton.innerText = "Ubah Tipe";
        changeTypeButton.addEventListener("click", function () {
                changeTransactionType(transaction.id);
            }
        );

        const deleteButton = document.createElement("button");
        deleteButton.setAttribute("data-testid", "transactionItemDeleteButton");
        deleteButton.innerText = "Hapus";
        deleteButton.addEventListener("click",function () {
                deleteTransaction(transaction.id);
            }
        );

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(changeTypeButton);
        buttonContainer.appendChild(deleteButton);

        card.appendChild(buttonContainer);

        if (transaction.type == "income"){
            incomeList.appendChild(card);
        } else {
            expenseList.appendChild(card);
        }
    }
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array
form.addEventListener("submit", function (e){
    e.preventDefault();

    const title = titleInput.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const type = typeInput.value;

    /**
     * TODO [Skilled]:
     * Tambahkan validasi input sebelum menyimpan data:
     *  - Tampilkan alert() dan hentikan proses jika judul kosong
     *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
     */

    if (title.trim() == "") {
        alert("Judul transaksi tidak boleh kosong"); 
        return;
    }

    if (amount < 1) {
        alert("Nominal minimal Rp1");
        return;
    }
    
    if (editId == null) {
        const transaction = {
            id: generateId(),
            title: title,
            amount: amount,
            date: date,
            type: type
        };

        transactions.push(transaction);
    } else {
        for (const transaction of transactions) {
            if (transaction.id == editId) {
                transaction.title = title;
                transaction.amount = amount;
                transaction.date = date;
                transaction.type = type;
                break;
            }
        }

        editId = null;
        submitButton.innerText = "Simpan";
    }

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    form.reset();
});

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */
function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    }

    const balance = totalIncome - totalExpense;

    document.querySelector(".tracker-summary__balance-amount").innerText = "Rp " + balance;
    document.querySelector(".tracker-summary__stat-amount--income").innerText = "Rp " + totalIncome;
    document.querySelector(".tracker-summary__stat-amount--expense").innerText = "Rp " + totalExpense;
}


/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
function saveData() {
    const parsed = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEY, parsed);
}

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data !== null) {
        transactions = JSON.parse(data);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */
function deleteTransaction(id) {
    const newTransactions = [];

    for (const transaction of transactions) {
        if (transaction.id != id) {
            newTransactions.push(transaction);
        }
    }

    transactions = newTransactions;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */
function editTransaction(id) {
    for (const transaction of transactions) {
        if (transaction.id == id) {
            titleInput.value = transaction.title;
            amountInput.value = transaction.amount;
            dateInput.value = transaction.date;
            typeInput.value = transaction.type;
            
            editId = id;
            submitButton.innerText = "Update";
            break;
        }
    }
}

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */
document.addEventListener(RENDER_EVENT, function () {
    renderTransactions();
    updateSummary();
});


/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */
function changeTransactionType(id) {
    for (const transaction of transactions) {
        if (transaction.id == id) {
            if (transaction.type == "income") {
                transaction.type = "expense";
            } else {
                transaction.type = "income";
            }
            
            break;
        }
    }

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */
const searchInput = document.getElementById("searchTransactionFormTitleInput");
searchInput.addEventListener("input", function() {
    const keyword = this.value.toLowerCase();

    if (keyword == "") {
        renderTransactions();
        return;
    }

    const filtered = [];

    for (const transaction of transactions) {
        if (transaction.title.toLowerCase().includes(keyword)) {
            filtered.push(transaction);
        }
    }
    renderTransactions(filtered);
});

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */

document.getElementById("searchTransactionForm").addEventListener("submit", function (e) {
    e.preventDefault();
});

loadData();