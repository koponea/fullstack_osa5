# Repositorio fullstack_osa5

******UNDER CONSTRUCTION !! all tests playable***

Tämä repositorio sisältää kurssin osan 5 tehtävien palautuksen (5.X) Tehtävien toteutuksen vaatimukset on kuvattu kurssin sivuilla, https://fullstackopen.com/osa5

## Palautusrepositoriot, vapaa kuvaus tehtävistä

### fullstack_osa1

- Kurssitiedot (stepit 1-5)
- Unicafe
- Anekdootit

### fullstack_osa2

- Kurssitiedot (stepit 6-9 ja moduuli -erotustehtävä)
- Puhelinluettelo (stepit 1-12)
- Maidentiedot (stepit 1-3)

### fullstack_osa3

- Puhelinluettelon front- ja backend, stepit 1-12, mongodb personApp ja mongoose (tehtävä 3.12),
- Puhelinluettelo ja tietokanta: stepit 1-8 (tehtävät 3.13-20), fe käyttää be:ä ja databasea, virheidenkäsittely, duplikaatit, hae yksittäinen entry, /info, validointivirheet fe:hen.
- Viedään tietokantaa käyttävä sovellus nettiin (tehtävä 3.21)
- Eslint konfigurointi (tehtävä 3.22)
- Tämän osan appin backend production-frontendilla on Renderissä (ei käynnissä yleensä aikalaskutuksen vuoksi), url: '<https://fullstack-osa3-u4wc.onrender.com>'

### fullstack_osa4

#### 4a projektin rakenne ja testauksen alkeet

- Blogilista backend, step 1 (tehtävä 4.1), annetun index.js:n muuttaminen npm-projektiksi. Sisältää mongodb-urlin sisältävän env-muuttujan käyttöönoton. Ei sisällä apien muuttamisia eikä BE-virheenkäsitelyn lisäämistä tms vielä
- Blogilista backend, step 2 (tehtävä 4.2), blogilistan backendin modulointi ja täydennetty myös virheenhallintaa, loggausta ja apikäsittelyä
- Apufunktioita ja yksikkötestejä, stepit 1-5 (tehtävät 4.3-4.7*), dummy, total_likes, favourite_blog, most_bloggers ja most_likes -testit sekä kohdefunktiot

#### 4b backendin testaaminen, INTEGRAATIOTESTIT (API:sta be->db)

- Blogilista: test_help.js lisäys myös 4a:n testidatat
- Blogilistan testit, stepit 1-5 (testi 4.8-4.12*) GET, POST ja 'id' attribuutti, default-arvo ja olemassaolovaatimus modelissa
- Blogilistan laajennus: stepit 1-2 (testit 4.13-4.14*) DELETE, PUT ja testit

#### 4c ja d käyttäjien hallinta ja tokenperustainen kirjautuminen

- Blogilistan laajennus, stepit 3-7 (testit 4.15-4.19).
  - Käyttäjien tietokanta, POST ja GET sekä testit
  - Käyttäjän kredentiaalien validointi ja testit
  - Populoidaan käyttäjän tiedot blogiin ja blogin käyttäjään
  - Tokenperustainen autentikointi login ja post.
- Steppi 8&10 (t4.20* ja 22*) on autentikoinnin refaktorointia middlewareksi
- Steppi 9 (t4.21*), deletointi onnistuu vain blogin luojalta
- Stepit 10-11 (t.4.22* ja 4.23*), userExtractor middleware postille ja deletelle, get pitää pitää tokenitta, testi tokenien puuttumiselle (unauthorized).
- Edellisien token-laajennusosien rikkomat testit korjattu (steppi 11, t.4.23)

### fullstack_osa5

Tässä osassa on otettu pohjaksi erikseen valmiina annettu osan 3 frontend, mutta se toteuttaa tietenkin kaikki edelliset funktionaaliset kohdat osasta __fullstack_osa3__ kuten myös ehdotettu mallivastauksen backend osasta __fullstack_osa4__. Joitakin tarkennuksia ja konffauksia omasta backend-toteutuksesta on saatettu lisätä näihin nyt kloonattuihin front- ja backendeihin. Tässä repossa on säilöttynä eri repossa sijaitsevan (oma tuotos+mallivastaus -hybridi) __Notes-appin Playwright -testaus__ joka on muotoutunut kurssin kulussa.

#### React-sovelluksen testaaminen, React Router

- __5a: Kirjautuminen frontendissä__
Tehtävät 5.1-5.4, blogs-frontin tokeneilla sisäänkirjautuminen ja blogien lisääminen, kirjautuminen pysyvä ja notifikaatiot.
- __5b: props.children ja komponentin ref__
Tehtävät 5.5.-5.11. Näkymän osien togglailua, esim Uusi blogi -lomake näkyy vain tarvittaessa, likejen päivittely, muotoilua ja blogin poisto.
- __5c: React-sovellusten testaaminen__
5.13-16: blogilistan testit, step1-4: Blog renderöityy ja hide/show komponentissa, käyttäjän simulointi, funktioiden simulointi nappeja painellessa. BlogForm:in toiminta.
- __5d: End to end -testaus, Playwright -hakemisto: e2e__
5.17-5.23: stepit 1-7: Playwright-testit Blogilista-appille, projekti, säädöt ja ensimmäiset caset, loginin tarkistus ja login. Kirjautunut käyttäjä pystyy luomaan blogin, ja sitä pystytään likettämään. Käyttäjä joka ei ole luonut kyseistä blogia ei saa nähdä poistonappulaa (fe-muutos myös). Delete ja window-confirm -dialogin käsittely blogin luojan poistaessa blogin. Viimeisenä testinä blogien verifiointiskenaario, jossa käyttäjä likettelee blogeja ja ne itsestäänjärjestyvät lennossa likejenmukaiseen alenevaan järjestykseen.

__Huom: Playwright-projektiin kuuluu e2e/.env -tiedosto, katso käyttöohjeet e2e/example.env -tiedostosta__

******5 PW UNDER CONSTRUCTION !! all tests playable***

__KOODI JA TESTIT AJANTASAISESTI YHTENEVÄT KAIKISSA REPOISSA JA _KAIKKI TEHTÄVÄT OVAT VALMIITA_ (kaikki materiaalissa annetut tehtävät järjestyksessä palautettu/tehty)__
