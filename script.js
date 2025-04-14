const API_KEY = 'AIzaSyA1FTl1AxuB5K6my_pMo0U13jX_dBnZyMA';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// 인기 동영상 가져오기
async function fetchPopularVideos() {
  const url = `${BASE_URL}?part=snippet,statistics&chart=mostPopular&regionCode=KR&maxResults=48&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayVideos(data.items);
  } catch (error) {
    console.error("인기 동영상 불러오기 실패:", error);
  }
}

// 받아온 데이터를 HTML에 출력
function displayVideos(videos) {
  const container = document.getElementById("video-list");
  container.innerHTML = "";

  videos.forEach(video => {
    const { title, thumbnails, channelTitle, publishedAt, channelId } = video.snippet;
    const viewCount = video.statistics?.viewCount ?? 0;

    const videoCard = document.createElement("article");
    videoCard.className = "video-card";
    videoCard.innerHTML = `
      <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" class="video-link">
        <img class="thumbnail" src="${thumbnails.medium.url}" alt="${title}">
        <div class="video-info">
          <div class="channel-avatar" data-channel-id="${channelId}" aria-hidden="true">${channelTitle.charAt(0)}</div>
          <div class="video-details">
            <h3 class="video-title">${title}</h3>
            <p class="channel-name">${channelTitle}</p>
            <p class="video-stats">조회수 ${Number(viewCount).toLocaleString()}회 • ${timeAgo(publishedAt)}</p>
          </div>
        </div>
      </a>
    `;

    container.appendChild(videoCard);
    fetchChannelThumbnail(channelId, videoCard); // 채널 썸네일 불러오기
  });
}

// 채널 썸네일 가져오기
async function fetchChannelThumbnail(channelId, videoCardElement) {
  if (!channelId || !videoCardElement) return;

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data?.items && data.items.length > 0) {
      const thumbnailUrl = data.items[0].snippet?.thumbnails?.default?.url;

      if (thumbnailUrl) {
        const avatarElement = videoCardElement.querySelector(`.channel-avatar[data-channel-id="${channelId}"]`);
        if (avatarElement) {
          avatarElement.style.backgroundImage = `url('${thumbnailUrl}')`;
          avatarElement.style.backgroundSize = "cover";
          avatarElement.style.backgroundPosition = "center";
          avatarElement.textContent = ""; // 텍스트 제거
        }
      }
    }
  } catch (error) {
    console.error("채널 썸네일 가져오기 오류:", error);
  }
}

// "n일 전"으로 바꾸기 위한 함수
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  return diff === 0 ? "오늘" : `${diff}일 전`;
}

// 검색 함수 
async function searchVideos(query) {
  const url = `${SEARCH_URL}?part=snippet&type=video&maxResults=48&q=${encodeURIComponent(query)}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const videoIds = data.items.map(item => item.id.videoId).join(',');
    if (videoIds) {
      fetchVideosByIds(videoIds);
    } else {
      document.getElementById("video-list").innerHTML = `<p>검색 결과가 없습니다.</p>`;
    }
  } catch (error) {
    console.error("검색 실패:", error);
  }
}

// 검색된 videoId로 영상 정보 다시 가져오기
async function fetchVideosByIds(videoIds) {
  const url = `${BASE_URL}?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayVideos(data.items);
  } catch (error) {
    console.error("동영상 정보 불러오기 실패:", error);
  }
}

// 검색창 이벤트 연결
document.getElementById("search-btn").addEventListener("click", handleSearch);
document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

function handleSearch() {
  const query = document.getElementById("search-input").value.trim();
  if (query) {
    searchVideos(query);
  }
}

// 실행
fetchPopularVideos();
