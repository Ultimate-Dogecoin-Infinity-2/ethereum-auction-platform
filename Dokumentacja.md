# Wstęp 
Przedstawiamy aplikację obsługującą aukcję drugiej ceny na blockchainie Etherneum. 
Składa się ona ze smart kontraktu aukcji oraz aplikacji po stronie klienta umożliwiającej 
tworzenie aukcji i branie w nich udziału. 
Wszystkie smart kontrakty zawarte w projekcie zostały zaimplementowane 
w języku Solidity, natomiast aplikacja po stronie klienta jest
oparta o JavaScript i HTML.

Specyfikacja:
* użytkownik jest w stanie utworzyć aukcję drugiej ceny poprzez dostarczenie
ceny startowej, terminów kolejnych faz aukcji^1 oraz opisu przedmiotu/usługi, którą sprzedaje
* dla danej aukcji użytkownik jest w stanie zgłosić swoją cenę poprzez 
odpowiednie postępowanie w kolejnych fazach aukcji
* po zakończeniu aukcji jej właściciel może odebrać zapłatę od zwycięzcy, natomiast gracze
mogą odzyskać swoje zablokowane na kontrakcie pieniądze 

-footnote: opis faz zostanie przedstawiony w dalszej części raportu

# Aukcja drugiej ceny na blockchainie
W aukcji drugiej ceny uczestnicy aukcji jednocześnie zgłaszają swoje 
odzywki. Zwycięzcą takiej aukcji zostaje gracz, który zgłosił największą
odzywkę, spośród tych którzy przekroczyli cenę startową ustaloną przez 
operatora aukcji. 
Zapłata zwycięzcy wynosi maksimum z ceny startowej 
oraz drugiej największej odzywki spośród 
wszystkich graczy.

Zaletą takiej aukcji jest to, że jest ona motywacyjnie zgodna,
tzn. każdemu uczestnikowi opłaca się zgłosić cenę jaką 
rzeczywiście ma dla niego licytowany przedmiot.

Założenie o jednoczesnym zgłoszeniu odzywek oczywiście jest jedynie uproszczeniem.
W rzeczywistości wymaganym założeniem jest, aby gracze zdecydowali się na swoje
odzywki nie znając zgłoszeń innych graczy. Zrealizujemy
to założenie poprzez podział aukcji na trzy fazy.
W skrócie, w pierwszej fazie gracze będą zgłaszali swoje odzywki
poprzez wysyłanie zahaszowanych zgłoszeń, a w drugiej fazie będą odsłaniali 
wysłane wcześniej zgłoszenia. 
W ostatniej, trzeciej fazie gracze będą mogli odebrać swoje zablokowane pieniądze.

## Faza zgłoszeń
W pierwszej fazie razem z zahaszowanym zgłoszeniem gracze muszą wysłać
fundusze pokrywające to zgłoszenie. Zauważmy jednak, że gdyby wysłali w jednej transakcji 
dokładnie tyle ile chcą zgłosić to tracimy ukrycie zgłoszeń, 
które chcieliśmy uzyskać za pomocą haszy.
Z tego powodu wprowadzamy dwie możliwości na naprawę tego problemu,
które gracz może zastosować równocześnie:
* możemy rozdzielić pojedyczne zgłoszenie na kilka transakcji
* możemy wysyłać więcej pieniędzy niż zgłaszamy
Aby to osiągnąć zgłoszenie będzie składało się z unikalnego id, zgłaszanej ceny oraz 
adresu, na który mają zostać zwrócone pieniądze. 
Wysłanie częściowego zgłoszenia będzie polegało teraz na wysłaniu
wraz z pieniędzmi hasza krotki (id zgłoszenia, adres zwrotu, zgłaszana cena, sól), gdzie 
sól to identyfikator częściowego zgłoszenia.
Z punktu widzenia kontraktu nie jesteśmy w stanie w tej fazie rozpoznać 
zgłoszeń, zatem spamiętujemy tylko ile funduszy niosą ze sobą kolejne hasze.


## Faza odsłonień
W drugiej fazie gracze będą odsłaniali swoje zgłoszenia poprzez wysyłanie 
niezahaszowanych częściowych zgłoszeń z pierwszej fazy.
W momencie odsłonięcia danego hasza spamiętujemy, że 
pieniądze, które były przysłane razem z nim są teraz zablokowane 
na konkretnym zgłoszeniu.
Dane zgłoszenie będzie brane pod uwagę w aukcji dopiero w momencie 
kiedy fundusze na nim zablokowane osiągną zgłaszaną cenę.

Zauważmy też, że gracze mogą oni nie odkryć swoich częściowych zgłoszeń, 
dzięki czemu mają możliwość manipulacji swoimi zgłoszeniami.
Aby zapewnić nieopłacalność takiego postępowania wprowadzamy dodatkowe
ograniczenie, że zwrot pieniędzy za dane zgłoszenie można uzyskać tylko wtedy,
gdy pieniądze zablokowane na nim w całości go pokrywają.

Ponadto, w celu równomiernego rozkładu opłat za gaz pomiędzy graczy. zwycięzca
aukcji jest już wyznaczany na bieżąco w drugiej turze.


## Faza zwrotów
W ostatniej fazie właściciel będzie mógł odzyskać zapłatę od zwycięzcy, 
natomiast gracze będą mogli odzyskać fundusze zablokowane na swoich pokrytych zgłoszeniach.


# Struktura projektu

Wszystkie smart kontratky zawarte w projekcie znajdują się 
w foldrze contracts. Główną częścią projktu jest kontrakt aukcji zaimplementowany 
w pliku Auction.sol. Zaimplementowany został kontrakt AuctionFactory, który 
pozwala tworzyć nowe aukcje i utrzymuje tablicę adresów stworzonych już aukcji.
Cała implementacja aplikacji po stronie klienta znajduje się w foldrze src.

# Implementacja kontraktu Auction
Poniższy rozdział zawiera najważniejsze informacje dotyczące implementacji
kontraktu Auction. 
Opis kontraktu zaczniemy od krótkiej informacji dotyczącej jednostek pieniędzy i czasu.

W całym kontrakcie wszystkie zmienne utrzymujące 
liczbę pieniędzy/cenę wykorzystują jako nominał wei. 

W przypadku czasu będziemy wykorzystywać czas uniksowy.
Do jego pomiaru przy spawdzaniu numeru obecnej fazy wykorzystywany jest 
block.timestamp. Warto zwrócić uwagę, że ten znacznik czasowy jest ustalany przez minera,
przez co może być przez niego lekko manipulowany (przy dużych 
odchyleniach od rzeczywistego czasu blok zostanie odrzucony przez innych minerów).
Z tego powodu niezalecane jest tworzenie aukcji o 
bardzo krótkich czasach trwania faz. Ponadto dla graczy zalecane jest, 
aby nie wysyłali transakcji w okolicach granic kolejnych faz.

Możemy teraz przejśc do opisu zmiennych, które 
zostają przekazane do konstruktora przy tworzeniu aukcji:
- phaseTwoStart : czas rozpoczęcia drugiej fazy podany jako Unix timestamp.
- phaseThreeStart : czas rozpoczęcia trzeciej fazy podany jako Unix timestamp
- description : opis licytowanego przedmiotu
- startingPrice: cena początkowa podana w Wei
- owner : adres na który ma zostać przelana zapłata zwycięzcy aukcji

Wszystkie odsłonięte zgłoszenia w aukcji są spamiętywane 
w mappingu revealedBids z id zgłoszenia do szczegółów tego zgłoszenia.
Do reprezentowania szczegółów zgłoszenia wykorzystywana jest struktura
Bid składająca się z pól revealedWeis, biddedPrice oraz returnAddress, gdzie
revealedWeis to zebrane na tym zgłoszeniu fundusze. 
Tak jak wcześniej wspomniano zgłoszenie to jest brane pod uwagę w aukcji 
tylko wtedy gdy revealedWeis >= biddedPrice.
--ewentualnie od pauz

Do reprezenetacji częściowych zgłoszeń służy z kolei struktur BidReveal. 

Ponadto aukcja utrzymuje informacje potrzebne do wyznaczenia zwycięzcy tzn:
- firstBidder: id zgłoszenia o największej kwocie
- firstPrice: najwyższa zgłoszona kwota
- secondPrice: druga najwyższa zgłoszona kwota
Zmienne firstBidder oraz secondPrice są publiczne.
W trzeciej fazie zawierają one id zwycięskiego zgłoszenia oraz cenę 
jaką zapłacił zwycięzca za wygranie aukcji.

Przejdźmy teraz do opisu najważniejszych informacji dotyczących kolejnych faz.

## PIERWSZA FAZA
W pierwszej fazie gracze mogą wysyłać hasze swoich częściowych zgłoszeń
za pomocą funkcji placeBid(bytes32).  Wymagane jest, żeby wraz z haszem wysłać niezerową 
liczbę pieniędzy. Ponadto nie można dwa razy zgłosić tego samego hasza. 
Zgłoszone hasze są za pomocą mappingu z wartości frozenWeis hasza do funduszy, 
które zostały wraz z nim przesłane.


## DRUGA FAZA
W drugiej fazie gracze mogą odsłaniać swoje zgłoszenia 
wykorzystując funkcję revealBids. Przyjmuje tablicę 
zmiennych typu BidReveal dzięki czemu gracze mogą odsłonić wszystkie swoje
zgłoszenia wywołując ją tylko raz.

Funkcja ta zaczyna od sprawdzenia poprawności częściowego zgłoszenia
wykonując poniższe operacje:
- sprawdzamy czy hasz tego częściowego zgłoszenia został wysłany w pierwszej fazie
i nie został do tej pory odsłonięty
- w przypadku gdy zostało już wcześniej odsłonięte inne częściowe zgłoszenie
mające to samo id zgłoszenia sprawdzamy, czy jest to, to samo zgłoszenie
(wymuszamy równość adresów zwrotu oraz zgłoszonej ceny)
Z powodu drugiego przypadku zalecane jest, aby przy tworzeniu zgłoszeń
generować losowe id. 


W sytuacji kiedy częściowe zgłoszenie okaże się poprawne
przenosimy fundusze spamiętene pod tym haszem do zgłoszenia. 
Zauważmy, że w ten sposób zapominamy o zgłoszonym haszu, przez co zablokujemy możliwość
jego podwójnego odblokowania.

Ostatnia część funkcji revealBids sprawdza czy właśnie pokryliśmy funduszami 
nasze zgłoszenie i jeśli tak, to aktualizujemy wynik aukcji.
Zauważmy, że aby uniknąć wielokrotnego uwzględnienia jegnego zgłoszenia,
nie wykonujemy aktualizacji jeśli było ono już wcześniej pokryte.
W samej aktualizacji wyniku aukcji remisy rozstrzygane są na korzyć zgłoszeń, 
które zostały wcześniej pokryte.

## TRZECIA FAZA
W trzeciej fazie użytkownicy mają do dyspozycji dwie funkcje withdrawBidder
i withdrawDealer. 
Pierwsza z nich pozwala użytkownikow wycofać pieniądze zebrane na 
danym zgłoszeniu poprzez podanie id tego zgłoszenia.
W przypadku zwycięzcy aukcji zwrócona kwota, będzie pomniejszona o cenę
jaką będzie on płacić za wygranie aukcji.
Z kolei funkcja withdrawDealer pozwala na wysłanie do 
właściciela aukcji zapłaty od zwycięzcy.