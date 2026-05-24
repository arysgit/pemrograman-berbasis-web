var app = new Vue({
  el: '#app',
  data: {
    upbjjList: ['Jakarta', 'Surabaya', 'Makassar', 'Padang', 'Denpasar'],
    kategoriList: ['MK Wajib', 'MK Pilihan', 'Praktikum', 'Problem-Based'],
    pengirimanList: [
      { kode: 'REG', nama: 'Reguler (3-5 hari)' },
      { kode: 'EXP', nama: 'Ekspres (1-2 hari)' }
    ],
    paket: [
      { kode: 'PAKET-UT-001', nama: 'PAKET IPS Dasar', isi: ['EKMA4116', 'EKMA4115'], harga: 120000 },
      { kode: 'PAKET-UT-002', nama: 'PAKET IPA Dasar', isi: ['BIOL4201', 'FISIP4001'], harga: 140000 }
    ],
    stok: [
      {
        kode: 'EKMA4116',
        judul: 'Pengantar Manajemen',
        kategori: 'MK Wajib',
        upbjj: 'Jakarta',
        lokasiRak: 'R1-A3',
        harga: 65000,
        qty: 28,
        safety: 20,
        catatanHTML: '<em>Edisi 2024, cetak ulang</em>'
      },
      {
        kode: 'EKMA4115',
        judul: 'Pengantar Akuntansi',
        kategori: 'MK Wajib',
        upbjj: 'Jakarta',
        lokasiRak: 'R1-A4',
        harga: 60000,
        qty: 7,
        safety: 15,
        catatanHTML: '<strong>Cover baru</strong>'
      },
      {
        kode: 'BIOL4201',
        judul: 'Biologi Umum (Praktikum)',
        kategori: 'Praktikum',
        upbjj: 'Surabaya',
        lokasiRak: 'R3-B2',
        harga: 80000,
        qty: 12,
        safety: 10,
        catatanHTML: 'Butuh <u>pendingin</u> untuk kit basah'
      },
      {
        kode: 'FISIP4001',
        judul: 'Dasar-Dasar Sosiologi',
        kategori: 'MK Pilihan',
        upbjj: 'Makassar',
        lokasiRak: 'R2-C1',
        harga: 55000,
        qty: 2,
        safety: 8,
        catatanHTML: 'Stok <i>menipis</i>, prioritaskan reorder'
      }
    ],
    search: '',
    filterUpbjj: '',
    filterKategori: '',
    sortBy: 'kode',
    hanyaKritis: false,
    pesanFilter: '',
    formMessage: '',
    formError: false,
    form: {
      kode: '',
      judul: '',
      kategori: '',
      upbjj: '',
      lokasiRak: '',
      harga: 0,
      qty: 0,
      safety: 0
    }
  },
  computed: {
    filteredStok: function () {
      var keyword = this.search.toLowerCase();
      var data = this.stok.filter(function (item) {
        var cocokSearch = item.kode.toLowerCase().includes(keyword) ||
          item.judul.toLowerCase().includes(keyword);
        var cocokUpbjj = !this.filterUpbjj || item.upbjj === this.filterUpbjj;
        var cocokKategori = !this.filterKategori || item.kategori === this.filterKategori;
        var cocokKritis = !this.hanyaKritis || item.qty <= item.safety;

        return cocokSearch && cocokUpbjj && cocokKategori && cocokKritis;
      }, this);

      return data.sort(function (a, b) {
        if (this.sortBy === 'qty') {
          return a.qty - b.qty;
        }

        if (this.sortBy === 'harga') {
          return b.harga - a.harga;
        }

        return String(a[this.sortBy]).localeCompare(String(b[this.sortBy]));
      }.bind(this));
    },
    totalItem: function () {
      return this.stok.length;
    },
    totalKritis: function () {
      return this.stok.filter(function (item) {
        return item.qty <= item.safety;
      }).length;
    },
    totalNilaiStok: function () {
      return this.stok.reduce(function (total, item) {
        return total + (item.harga * item.qty);
      }, 0);
    }
  },
  methods: {
    formatCurrency: function (value) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value);
    },
    statusStok: function (item) {
      if (item.qty === 0) {
        return 'Habis';
      }

      if (item.qty <= item.safety) {
        return 'Kritis';
      }

      return 'Aman';
    },
    statusClass: function (item) {
      if (item.qty === 0) {
        return 'danger';
      }

      if (item.qty <= item.safety) {
        return 'warning';
      }

      return 'success';
    },
    resetFilter: function () {
      this.search = '';
      this.filterUpbjj = '';
      this.filterKategori = '';
      this.sortBy = 'kode';
      this.hanyaKritis = false;
      this.pesanFilter = 'Filter dikembalikan ke kondisi awal.';
    },
    tambahStok: function () {
      this.formError = true;

      if (!this.form.kode || !this.form.judul || !this.form.kategori || !this.form.upbjj) {
        this.formMessage = 'Kode, judul, kategori, dan UPBJJ wajib diisi.';
        return;
      }

      var kodeSudahAda = this.stok.some(function (item) {
        return item.kode.toUpperCase() === this.form.kode.toUpperCase();
      }, this);

      if (kodeSudahAda) {
        this.formMessage = 'Kode bahan ajar sudah terdaftar.';
        return;
      }

      if (this.form.harga <= 0 || this.form.qty < 0 || this.form.safety < 0) {
        this.formMessage = 'Harga harus lebih dari 0, qty dan safety tidak boleh negatif.';
        return;
      }

      this.stok.push({
        kode: this.form.kode.toUpperCase(),
        judul: this.form.judul,
        kategori: this.form.kategori,
        upbjj: this.form.upbjj,
        lokasiRak: this.form.lokasiRak || '-',
        harga: this.form.harga,
        qty: this.form.qty,
        safety: this.form.safety,
        catatanHTML: '<em>Data baru dari input pengguna</em>'
      });

      this.formMessage = 'Data stok berhasil ditambahkan.';
      this.formError = false;
      this.form = {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: 0,
        qty: 0,
        safety: 0
      };
    }
  },
  watch: {
    filterUpbjj: function (value) {
      this.pesanFilter = value ? 'Filter UPBJJ aktif: ' + value : 'Filter UPBJJ dihapus.';
    },
    filterKategori: function (value) {
      this.pesanFilter = value ? 'Filter kategori aktif: ' + value : 'Filter kategori dihapus.';
    },
    hanyaKritis: function (value) {
      this.pesanFilter = value ? 'Menampilkan stok yang berada di batas safety.' : 'Menampilkan semua status stok.';
    },
    'form.qty': function (value) {
      if (value < this.form.safety) {
        this.formMessage = 'Qty lebih kecil dari safety stock. Data akan berstatus kritis.';
        this.formError = false;
      }
    }
  }
});
