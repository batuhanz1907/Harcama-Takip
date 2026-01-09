Expense Tracker

Expense Tracker, kullanıcıların günlük harcamalarını kolayca takip edebileceği
basit ve modern bir web uygulamasıdır.  
Uygulama, temel finans takibi mantığını göstermek ve frontend becerilerini
sergilemek amacıyla geliştirilmiştir.

## 🚀 Özellikler
- Harcama ekleme (açıklama, tutar, kategori, tarih)
- Kategori bazlı harcama takibi
- Harcama geçmişini listeleme
- Harcama silme
- Toplam harcama tutarını anlık gösterme
- LocalStorage ile veri saklama (sayfa yenilense bile veriler kaybolmaz)

## 🛠 Kullanılan Teknolojiler
- HTML
- CSS
- JavaScript

## 🧠 Proje Mantığı
Harcamalar JavaScript objeleri olarak tutulur ve bir dizi içerisinde saklanır.
Her ekleme veya silme işleminden sonra:
- Liste yeniden render edilir
- Toplam harcama tutarı hesaplanır
- Güncel veri LocalStorage’a kaydedilir

Bu yapı sayesinde uygulama basit, hızlı ve sürdürülebilir bir şekilde çalışır.
