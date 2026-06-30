// 지도는 HTML에서 이미 생성됐으니까 map 변수 그대로 사용
var placeOverlay = new kakao.maps.CustomOverlay({ zIndex: 1 });
var contentNode = document.createElement('div');
contentNode.className = 'placeinfo_wrap';
placeOverlay.setContent(contentNode);

var markers = [];
var activeFilter = null;

// 주차장 버튼
$('#btn-parking').on('click', function () {
  if (activeFilter === 'parking') {
    activeFilter = null;
    $(this).removeClass('active');
    removeMarker();
    placeOverlay.setMap(null);
  } else {
    activeFilter = 'parking';
    $('#btn-parking, .branch-btn').removeClass('active');
    $(this).addClass('active');
    searchByCategory('PK6'); // PK6 = 주차장 카테고리 코드
  }
});

// 가맹점 버튼 (더미 처리)
$('.branch-btn').on('click', function () {
  var index = $(this).data('index');

  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    removeMarker();
    activeFilter = null;
  } else {
    $('#btn-parking, .branch-btn').removeClass('active');
    $(this).addClass('active');
    activeFilter = 'branch';
    removeMarker();
    showSingleBranch(index);
  }
});

function showSingleBranch(index) {
  var b = branchData[index];

  var markerImage = new kakao.maps.MarkerImage(
    './image/common/location-05.png', // 기본 주소 마커 이미지
    new kakao.maps.Size(64, 69),
    { offset: new kakao.maps.Point(32, 69) }
  );

  var marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(b.lat, b.lng),
    title: b.name,
    image: markerImage
  });

  var iw = new kakao.maps.InfoWindow({
    content:
      '<div style="padding:8px 12px;font-size:12px;line-height:1.5;white-space:nowrap;">' +
      '<strong>' + b.name + '</strong><br>' + b.addr +
      '</div>'
  });

  kakao.maps.event.addListener(marker, 'click', function () {
    iw.open(map, marker);
  });

  markers.push(marker);
  map.setCenter(new kakao.maps.LatLng(b.lat, b.lng));
}

function searchByCategory(code) {
  removeMarker();
  map.setCenter(new kakao.maps.LatLng(37.30836859, 126.85098));
  var ps = new kakao.maps.services.Places();
  ps.categorySearch(code, function (data, status) {
    if (status === kakao.maps.services.Status.OK) {
      data.forEach(function (place) {

        var markerImage = new kakao.maps.MarkerImage(
          './image/common/location_parking-09.png',
          new kakao.maps.Size(20, 20),
          { offset: new kakao.maps.Point(20, 40) }
        );

        var marker = new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(place.y, place.x),
          title: place.place_name,
          image: markerImage
        });
        kakao.maps.event.addListener(marker, 'click', function () {
          displayPlaceInfo(place);
        });
        markers.push(marker);
      });
    }
  }, { location: new kakao.maps.LatLng(37.30836859, 126.85098), radius: 1000 });
}

function displayPlaceInfo(place) {
  var content = '<div class="placeinfo">' +
    '<a class="title" href="' + place.place_url + '" target="_blank">' + place.place_name + '</a>' +
    '<span>' + (place.road_address_name || place.address_name) + '</span>' +
    '<span class="tel">' + place.phone + '</span>' +
    '</div><div class="after"></div>';
  contentNode.innerHTML = content;
  placeOverlay.setPosition(new kakao.maps.LatLng(place.y, place.x));
  placeOverlay.setMap(map);
}

function removeMarker() {
  markers.forEach(function (m) { m.setMap(null); });
  markers = [];
}

// 가맹점 더미 데이터
var branchData = [
  { name: 'NODE 안양점', lat: 37.40049, lng: 126.91899, addr: '안양동 689-174' },
  { name: 'NODE 강남점', lat: 37.50153, lng: 127.02619, addr: '서초동 1308-6' },
  { name: 'NODE 인천점', lat: 37.458925, lng: 126.702758, addr: '구월동 1128-3' },
  { name: 'NODE 종로점', lat: 37.569503, lng: 126.985558, addr: '관철동 18-4' },
  { name: 'NODE 송파점', lat: 37.493738, lng: 127.120761, addr: '가락동 79-3' },
];

function showBranch() {
  removeMarker();
  branchData.forEach(function (b) {
    var marker = new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(b.lat, b.lng),
      title: b.name
    });
    var iw = new kakao.maps.InfoWindow({
      content: '<div style="padding:8px 12px;font-size:12px;line-height:1.5;white-space:nowrap;">' +
        '<strong>' + b.name + '</strong><br>' + b.addr + '</div>'
    });
    kakao.maps.event.addListener(marker, 'click', function () { iw.open(map, marker); });
    markers.push(marker);
  });
}