import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { BsArrowUpCircleFill, BsArrowDownCircleFill, BsDashCircleFill } from 'react-icons/bs';
import { GET_PRICE_API_URL, GET_PRICE_FROM_DB_API_URL, POST_PRICE_SAVE_API_URL } from '../../utils/apiurl';

const Today = () => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('200');
  const [frozenData, setFrozenData] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  // 쿠키 저장 함수
  const saveToJsonFile = async (data, time) => {
    try {
      // 데이터를 더 작은 단위로 분할
      const chunks = {};
      let currentChunk = {};
      let currentSize = 0;
      let chunkIndex = 0;
      
      Object.entries(data).forEach(([key, value]) => {
        const itemData = { [key]: value };
        const itemSize = JSON.stringify(itemData).length;
        
        // 각 청크를 2KB 이하로 유지
        if (currentSize + itemSize > 2000) {
          chunks[chunkIndex] = currentChunk;
          currentChunk = {};
          currentSize = 0;
          chunkIndex++;
        }
        
        currentChunk[key] = value;
        currentSize += itemSize;
      });
      
      // 마지막 청크 저장
      if (Object.keys(currentChunk).length > 0) {
        chunks[chunkIndex] = currentChunk;
      }
      
      // 청크 정보 저장 후 저장된 값 확인
      Cookies.set('frozen_price_chunks', JSON.stringify({
        count: chunkIndex + 1,
        lastUpdateTime: time.toISOString()
      }), {
        expires: 30,
        sameSite: 'lax',
        path: '/'
      });
      
      // 저장된 쿠키 값 확인
      const savedChunkInfo = Cookies.get('frozen_price_chunks');
      console.log('저장된 쿠키 원본:', savedChunkInfo);
      console.log('디코딩된 쿠키:', decodeURIComponent(savedChunkInfo));
      
      // 각 청크 저장
      let savedCount = 0;
      Object.entries(chunks).forEach(([index, chunkData]) => {
        try {
          Cookies.set(`frozen_price_chunk_${index}`, JSON.stringify(chunkData), {
            expires: 30,
            sameSite: 'lax',
            path: '/'
          });
          
          // 각 청크의 저장된 값 확인
          const savedChunk = Cookies.get(`frozen_price_chunk_${index}`);
          console.log(`청크 ${index} 원본:`, savedChunk);
          console.log(`청크 ${index} 디코딩:`, decodeURIComponent(savedChunk));
          
          savedCount++;
        } catch (e) {
          console.error(`청크 ${index} 저장 실패:`, e);
        }
      });
      
      // 모든 청크가 저장되었는지 확인
      if (savedCount === Object.keys(chunks).length) {
        setFrozenData(data);
        setLastUpdateTime(time);
        console.log('데이터 저장 완료:', {
          totalChunks: Object.keys(chunks).length,
          savedChunks: savedCount,
          timestamp: time.toISOString()
        });
      } else {
        throw new Error(`${Object.keys(chunks).length}개 중 ${savedCount}개의 청크만 저장됨`);
      }
      
    } catch (error) {
      console.error('쿠키 저장 중 오류:', error);
      console.error('오류 상세:', {
        errorMessage: error.message,
        cookieEnabled: navigator.cookieEnabled,
        currentCookies: document.cookie,
        decodedCookies: decodeURIComponent(document.cookie)
      });
    }
  };

  // 쿠키 로드 함수
  const loadFromJsonFile = async () => {
    try {
      const chunkInfo = Cookies.get('frozen_price_chunks');
      if (chunkInfo) {
        const { count, lastUpdateTime } = JSON.parse(decodeURIComponent(chunkInfo));
        const allData = {};
        
        // 모든 청크 로드
        for (let i = 0; i < count; i++) {
          const chunkData = Cookies.get(`frozen_price_chunk_${i}`);
          if (chunkData) {
            const decodedData = JSON.parse(decodeURIComponent(chunkData));
            Object.assign(allData, decodedData);
          }
        }
        
        if (Object.keys(allData).length > 0) {
          setFrozenData(allData);
          setLastUpdateTime(new Date(lastUpdateTime));
          setPriceData(allData); // 쿠키 데이터를 바로 priceData로 설정
        }
      }
    } catch (error) {
      console.error('쿠키 로드 중 오류:', error);
    }
  };

  // 데이터 업데이트 함수
  const updateData = (latestValidData, now, isWeekend, hasValidDpr1Data) => {
    const updateTime = new Date(now);
    updateTime.setHours(15, 0, 0, 0);

    console.log('updateData 호출:', {
      hasLatestData: !!latestValidData,
      isWeekend,
      hasValidDpr1Data,
      currentTime: now.toLocaleString(),
      updateTime: updateTime.toLocaleString()
    });

    if (isWeekend) {
      if (frozenData && lastUpdateTime) {
        console.log('주말: 프리징된 데이터 사용');
        setPriceData(frozenData);
      } else {
        console.log('주말: 새로운 데이터 프리징');
        setPriceData(latestValidData);
        // 저장 시점 확인
        console.log('데이터 저장 시도:', {
          hasData: !!latestValidData,
          dataKeys: Object.keys(latestValidData)
        });
        saveToJsonFile(latestValidData, now);
      }
    } else if (now >= updateTime) {
      if (!hasValidDpr1Data) {
        if (frozenData && lastUpdateTime) {
          console.log('평일 오후 3시 이후: 프리징된 데이터 사용 (유효한 당일 데이터 없음)');
          setPriceData(frozenData);
        } else {
          console.log('평일 오후 3시 이후: 새로운 데이터 프리징 (유효한 당일 데이터 없음)');
          setPriceData(latestValidData);
          // 저장 시점 확인
          console.log('데이터 저장 시도:', {
            hasData: !!latestValidData,
            dataKeys: Object.keys(latestValidData)
          });
          saveToJsonFile(latestValidData, now);
        }
      } else {
        console.log('평일 오후 3시 이후: 새로운 데이터로 업데이트 및 프리징');
        setPriceData(latestValidData);
        // 저장 시점 확인
        console.log('데이터 저장 시도:', {
          hasData: !!latestValidData,
          dataKeys: Object.keys(latestValidData)
        });
        saveToJsonFile(latestValidData, now);
      }
    } else {
      if (frozenData && lastUpdateTime) {
        console.log('평일 오후 3시 이전: 프리징된 데이터 사용');
        setPriceData(frozenData);
      } else {
        console.log('평일 오후 3시 이전: 새로운 데이터 프리징');
        setPriceData(latestValidData);
        // 저장 시점 확인
        console.log('데이터 저장 시도:', {
          hasData: !!latestValidData,
          dataKeys: Object.keys(latestValidData)
        });
        saveToJsonFile(latestValidData, now);
      }
    }
  };

  const savePriceData = async (data) => {
    try {
      const response = await axios.post(POST_PRICE_SAVE_API_URL, data);
      if (response.data.success) {
        console.log("가격 데이터 저장 성공");
      } else {
        console.error("가격 데이터 저장 실패:", response.data.message);
      }
    } catch (error) {
      console.error("가격 데이터 저장 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setLoading(true);
        // 먼저 쿠키에서 데이터 로드
        await loadFromJsonFile();
        
        // API에서 새로운 데이터 가져오기
        const response = await axios.get(GET_PRICE_API_URL);
        
        // API 응답 로깅
        console.log('API 응답:', response.data); // Vercel에서의 응답 확인

        // 응답 데이터 구조 확인
        if (response.data && response.data.data && Array.isArray(response.data.data.item)) {
          const latestValidData = {};
          let hasValidDpr1Data = false;

          // item 배열을 순회
          response.data.data.item.forEach(item => {
            // 필요한 속성이 존재하는지 확인
            if (!item.item_name || !item.unit || !item.category_code || !item.category_name) {
              console.error('API 응답 데이터 형식이 올바르지 않습니다:', item);
              return; // 필요한 속성이 없으면 다음 아이템으로 넘어감
            }

            const itemName = item.item_name;
            const hasDpr1 = item.dpr1 !== '-' && item.dpr1 !== undefined;
            const hasDpr2 = item.dpr2 !== '-' && item.dpr2 !== undefined;

            // dpr1 또는 dpr2가 유효한 경우에만 처리
            if (hasDpr1 || hasDpr2) {
              if (hasDpr1) hasValidDpr1Data = true;

              const price = hasDpr1 ? item.dpr1 : item.dpr2;
              const previousPrice = hasDpr2 ? item.dpr2 : price;

              const currentPrice = Number(price.replace(/,/g, ''));
              const lastPrice = Number(previousPrice.replace(/,/g, ''));

              latestValidData[itemName] = {
                price: price,
                unit: item.unit,
                date: item.day1, // 현재 날짜를 day1로 설정
                previousDate: item.day2, // 이전 날짜를 day2로 설정
                priceChange: currentPrice - lastPrice,
                yesterdayPrice: lastPrice,
                category_code: item.category_code,
                category_name: item.category_name,
                hasDpr1: hasDpr1
              };
            }
          });

          // 현재 시간이 오후 3시 이전인지 확인
          const now = new Date();
          const updateTime = new Date(now);
          updateTime.setHours(15, 0, 0, 0);
          
          // 주말 체크 (0: 일요일, 6: 토요일)
          const isWeekend = now.getDay() === 0 || now.getDay() === 6;
          
          if (Object.keys(latestValidData).length > 0) {
            // 데이터베이스에 저장
            try {
              const priceSaveResponse = await axios.post(POST_PRICE_SAVE_API_URL, 
                Object.entries(latestValidData).map(([item_name, data]) => ({
                  item_name,
                  price: data.price,
                  unit: data.unit,
                  date: data.date,
                  previous_date: data.previousDate.replace(/[()]/g, '').trim(),
                  price_change: data.priceChange,
                  yesterday_price: data.yesterdayPrice,
                  category_code: data.category_code,
                  category_name: data.category_name,
                  has_dpr1: data.hasDpr1
                }))
              );
              
              if (!priceSaveResponse.data.success) {
                console.error('데이터베이스 저장 실패:', priceSaveResponse.data.message);
              }
            } catch (error) {
              console.error('데이터베이스 저장 중 오류:', error.response?.data?.detail || error.message);
              // 에러 발생 시에도 계속 진행
            }
            
            updateData(latestValidData, now, isWeekend, hasValidDpr1Data);
          } else {
            console.error('API 응답 데이터 형식이 올바르지 않습니다:', response.data);
            setError('API 응답 데이터 형식이 올바르지 않습니다.');
          }
        } else {
          console.error('API 응답 데이터 형식이 올바르지 않습니다:', response.data);
          setError('API 응답 데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('Error fetching price data:', err);
        // API 호출 실패 시 데이터베이스에서 데이터 가져오기
        try {
          const dbResponse = await axios.get(GET_PRICE_FROM_DB_API_URL);
          if (dbResponse.data && dbResponse.data.data && Array.isArray(dbResponse.data.data.item)) {
            const dbData = {};
            dbResponse.data.data.item.forEach(item => {
              dbData[item.item_name] = item;
            });
            setPriceData(dbData);
          }
        } catch (dbError) {
          console.error('데이터베이스 조회 중 오류:', dbError);
          // 데이터베이스 조회 실패 시 쿠키 데이터 사용
          if (frozenData) {
            setPriceData(frozenData);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();

    // 매일 오후 3시에 데이터 업데이트 (주말 제외)
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    if (!isWeekend) {
      const updateTime = new Date(now);
      updateTime.setHours(15, 0, 0, 0);

      let timeUntilUpdate;
      if (now > updateTime) {
        updateTime.setDate(updateTime.getDate() + 1);
      }
      timeUntilUpdate = updateTime.getTime() - now.getTime();

      console.log('다음 업데이트 시간:', {
        updateTime: updateTime.toLocaleString(),
        timeUntilUpdate: Math.floor(timeUntilUpdate / 1000 / 60) + '분'
      });

      const updateTimer = setTimeout(() => {
        console.log('자동 업데이트 실행');
        fetchPriceData();
      }, timeUntilUpdate);

      return () => {
        console.log('타이머 정리');
        clearTimeout(updateTimer);
      };
    }
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!priceData || typeof priceData !== 'object') {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center">
          데이터 형식이 올바르지 않습니다.
        </Typography>
      </Container>
    );
  }

  // 현재 선택된 카테고리의 데이터만 필터링
  const filteredData = Object.entries(priceData).filter(([_, item]) => item.category_code === selectedCategory);

  // 필터링된 데이터가 없는 경우 처리
  if (filteredData.length === 0) {
    return (
      <Container>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mt: 4
          }}>
            <span role="img" aria-label="money bag">💰</span>
            오늘의 농산물 소비자 가격은?
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            aria-label="category tabs"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.2rem',
                fontWeight: 'bold',
                minWidth: '120px',
                padding: '12px 24px'
              }
            }}
          >
            <Tab 
              label="채소류" 
              value="200" 
              sx={{ 
                '&.Mui-selected': {
                  color: '#2e7d32'
                }
              }}
            />
            <Tab 
              label="곡물류" 
              value="100"
              sx={{ 
                '&.Mui-selected': {
                  color: '#ed6c02'
                }
              }}
            />
          </Tabs>
        </Box>
        <Typography variant="h6" align="center" sx={{ mt: 4, color: '#666' }}>
          선택한 카테고리의 데이터가 없습니다.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1" sx={{ 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mt: 4
          }}>
            <span role="img" aria-label="money bag">💰</span>
            오늘의 농산물 소비자 가격은?
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            aria-label="category tabs"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.2rem',
                fontWeight: 'bold',
                minWidth: '120px',
                padding: '12px 24px'
              }
            }}
          >
            <Tab 
              label="채소류" 
              value="200" 
              sx={{ 
                '&.Mui-selected': {
                  color: '#2e7d32'
                }
              }}
            />
            <Tab 
              label="곡물류" 
              value="100"
              sx={{ 
                '&.Mui-selected': {
                  color: '#ed6c02'
                }
              }}
            />
          </Tabs>
        </Box>
        <Typography variant="body2" align="right" sx={{ color: '#666' }}>
          가격단위: 원(₩)  |  기준일: {(filteredData[0]?.[1]?.date || '').replace(/^\d+일전\s*/, '')}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {filteredData.map(([key, item]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {key}
              </Typography>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    textAlign: 'right',
                    mb: 1
                  }}
                >
                  {item.unit}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mr: 2,
                    flex: 1
                  }}>
                    {item.priceChange > 0 ? (
                      <>
                        <BsArrowUpCircleFill style={{ color: '#ff4d4d', marginRight: '4px', flexShrink: 0, marginTop: '4px' }} />
                        <Typography sx={{ 
                          color: '#ff4d4d', 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          wordBreak: 'break-word'
                        }}>
                          +{item.priceChange.toLocaleString()} ({((item.priceChange / item.yesterdayPrice) * 100).toFixed(1)}%)
                        </Typography>
                      </>
                    ) : item.priceChange < 0 ? (
                      <>
                        <BsArrowDownCircleFill style={{ color: '#4d79ff', marginRight: '4px', flexShrink: 0, marginTop: '4px' }} />
                        <Typography sx={{ 
                          color: '#4d79ff', 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          wordBreak: 'break-word'
                        }}>
                          {item.priceChange.toLocaleString()} ({((item.priceChange / item.yesterdayPrice) * 100).toFixed(1)}%)
                        </Typography>
                      </>
                    ) : (
                      <>
                        <BsDashCircleFill style={{ color: '#666666', marginRight: '4px', flexShrink: 0, marginTop: '4px' }} />
                        <Typography sx={{ 
                          color: '#666666', 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          wordBreak: 'break-word'
                        }}>
                          0 (0.0%)
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                      flexShrink: 0
                    }}
                  >
                    {parseInt(item.price.replace(/,/g, '')).toLocaleString()}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                        ml: 0.5,
                        color: '#666'
                      }}
                    >
                      원
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Today;
