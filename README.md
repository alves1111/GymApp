# GymApp

Mahdollisimman simppeli sovellus progressiivisen kehityksen seurantaan kuntosalilla.
Ei riippuvuuksia: pelkkä HTML, CSS ja JavaScript-moduulit. Data tallentuu selaimen localStorageen.

## Käynnistys koneella

ES-moduulit vaativat HTTP-palvelimen (tiedoston tuplaklikkaus ei toimi):

```
python3 -m http.server 8000
```

Avaa http://localhost:8000. VS Codessa toimii myös Live Server -laajennus.

## Testit

```
npm test
```

## Puhelimeen

1. Vie kansio GitHubiin ja laita GitHub Pages päälle (Settings → Pages → branch `main`, `/root`).
2. Avaa osoite puhelimella → Jaa → Lisää Koti-valikkoon.
3. Sovellus toimii sen jälkeen myös ilman verkkoa.

Data on vain siinä puhelimessa. Ota välillä varmuuskopio etusivun "Vie varmuuskopio" -linkistä.

## Rakenne

| Tiedosto | Tehtävä |
|---|---|
| `js/program.js` | Saliohjelma: treenit, slotit, liikkeet, toistoalueet, painoaskeleet |
| `js/seed.js` | Vihkosta tuotu historia, ladataan ensimmäisellä käynnistyksellä |
| `js/logic.js` | Puhtaat funktiot: painoehdotus, muotoilu, vuorottelu |
| `js/storage.js` | localStorage-tallennus |
| `js/app.js` | Näkymät ja käyttöliittymän tapahtumat |
| `sw.js` | Service worker: offline-välimuisti |
