var app = new Vue({
  el: '#app',
  data: {
    tracking: {
      'DO2025-0001': {
        nim: '123456789',
        nama: 'Rina Wulandari',
        status: 'Dalam Perjalanan',
        ekspedisi: 'JNE',
        tanggalKirim: '2025-08-25',
        paket: 'PAKET-UT-001',
        total: 120000,
        perjalanan: [
          { waktu: '2025-08-25 10:12:20', keterangan: 'Penerimaan di Loket: TANGSEL' },
          { waktu: '2025-08-25 14:07:56', keterangan: 'Tiba di Hub: JAKSEL' },
          { waktu: '2025-08-26 08:44:01', keterangan: 'Diteruskan ke Kantor Tujuan' }
        ]
      },
      'DO2025-0002': {
        nim: '987654321',
        nama: 'Bagas Pratama',
        status: 'Selesai',
        ekspedisi: 'Pos Indonesia',
        tanggalKirim: '2025-08-24',
        paket: 'PAKET-UT-002',
        total: 140000,
        perjalanan: [
          { waktu: '2025-08-24 09:30:11', keterangan: 'Penerimaan di Loket: SURABAYA' },
          { waktu: '2025-08-24 17:20:18', keterangan: 'Tiba di Hub: SIDOARJO' },
          { waktu: '2025-08-25 11:15:44', keterangan: 'Diterima oleh penerima' }
        ]
      }
    },
    nomorDO: '',
    nomorAktif: '',
    hasilTracking: null,
    pernahCari: false,
    statusPesan: ''
  },
  computed: {
    jumlahPerjalanan: function () {
      return this.hasilTracking ? this.hasilTracking.perjalanan.length : 0;
    },
    updateTerakhir: function () {
      if (!this.hasilTracking || this.hasilTracking.perjalanan.length === 0) {
        return '-';
      }

      return this.hasilTracking.perjalanan[this.hasilTracking.perjalanan.length - 1].waktu;
    }
  },
  methods: {
    cariDO: function () {
      var kode = this.nomorDO.toUpperCase();
      this.nomorAktif = kode;
      this.hasilTracking = this.tracking[kode] || null;
      this.pernahCari = true;
      this.statusPesan = this.hasilTracking
        ? 'Data DO ditemukan.'
        : 'Data DO tidak ditemukan.';
    },
    resetCari: function () {
      this.nomorDO = '';
      this.nomorAktif = '';
      this.hasilTracking = null;
      this.pernahCari = false;
      this.statusPesan = 'Form pencarian dikosongkan.';
    },
    formatCurrency: function (value) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value);
    },
    formatDate: function (value) {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(new Date(value));
    }
  },
  watch: {
    nomorDO: function (value) {
      if (value && value !== value.toUpperCase()) {
        this.nomorDO = value.toUpperCase();
      }

      if (!value) {
        this.statusPesan = '';
      }
    },
    hasilTracking: function (value) {
      if (value) {
        this.statusPesan = 'Status terakhir: ' + value.status + ' melalui ' + value.ekspedisi + '.';
      }
    }
  }
});
