import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";

const Minigame = () => {
  const [money, setMoney] = useState(1000);
  const [inventory, setInventory] = useState({});
  const [crops, setCrops] = useState([]);
  const [message, setMessage] = useState('');
  const [season, setSeason] = useState('봄');
  const [weather, setWeather] = useState('맑음');
  const [farmSize, setFarmSize] = useState(10);
  const [tools, setTools] = useState({
    호미: { level: 1, durability: 100 }
  });
  const [fertilizers, setFertilizers] = useState({
    일반비료: 0,
    고급비료: 0,
    특급비료: 0
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [marketPrices, setMarketPrices] = useState({});
  
  const cropTypes = {
    // 봄 작물
    딸기: {
      growthTime: 60,
      price: 180,
      basePrice: 300,
      growthStages: ['🌱', '🍓'],
      season: ['봄'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    당근: {
      growthTime: 30,
      price: 80,
      basePrice: 120,
      growthStages: ['🌱', '🥕'],
      season: ['봄'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    양파: {
      growthTime: 45,
      price: 100,
      basePrice: 160,
      growthStages: ['🌱', '🧅'],
      season: ['봄', '겨울'],  // 봄, 겨울 모두 재배 가능
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    토마토: {
      growthTime: 90,
      price: 120,
      basePrice: 200,
      growthStages: ['🌱', '🍅'],
      season: ['봄', '여름'],  // 봄, 여름 모두 재배 가능
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },

    // 여름 작물
    오이: {
      growthTime: 40,
      price: 90,
      basePrice: 150,
      growthStages: ['🌱', '🥒'],
      season: ['여름'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    옥수수: {
      growthTime: 180,
      price: 200,
      basePrice: 350,
      growthStages: ['🌱', '🌽'],
      season: ['여름'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    레몬: {
      growthTime: 150,
      price: 220,
      basePrice: 380,
      growthStages: ['🌱', '🍋'],
      season: ['여름'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },

    // 가을 작물
    고구마: {
      growthTime: 120,
      price: 150,
      basePrice: 250,
      growthStages: ['🌱', '🍠'],
      season: ['가을'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    사과: {
      growthTime: 150,
      price: 200,
      basePrice: 400,
      growthStages: ['🌱', '🍎'],
      season: ['가을'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    키위: {
      growthTime: 130,
      price: 180,
      basePrice: 320,
      growthStages: ['🌱', '🥝'],
      season: ['가을'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },

    // 겨울 작물
    브로콜리: {
      growthTime: 40,
      price: 90,
      basePrice: 140,
      growthStages: ['🌱', '🥦'],
      season: ['겨울'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    },
    감자: {
      growthTime: 70,
      price: 160,
      basePrice: 280,
      growthStages: ['🌱', '🥔'],
      season: ['겨울'],
      fertilizerEffects: {
        일반비료: 0.7,
        고급비료: 0.5,
        특급비료: 0.3
      }
    }
  };

  const weatherIcons = {
    맑음: '☀️',
    비: '🌧️',
    흐림: '☁️',
    폭염: '🌡️',
    한파: '❄️'
  };

  const weatherDescriptions = {
    맑음: '작물의 성장 속도가 10% 증가합니다.',
    비: '작물이 정상적으로 자랍니다.',
    흐림: '작물이 정상적으로 자랍니다.',
    폭염: '작물의 성장 속도가 20% 감소합니다.',
    한파: '작물의 성장 속도가 20% 감소합니다.'
  };

  const weatherEffects = {
    맑음: 0.9,    // 10% 빠르게
    비: 1,        // 정상
    흐림: 1,      // 정상
    폭염: 1.2,    // 20% 느리게
    한파: 1.2     // 20% 느리게
  };

  const shopItems = {
    호미: {
      price: 1000,
      durability: 100
    },
    일반비료: {
      price: 50,
      amount: 1,
      description: '재배시간 30% 감소'
    },
    고급비료: {
      price: 100,
      amount: 1,
      description: '재배시간 50% 감소'
    },
    특급비료: {
      price: 200,
      amount: 1,
      description: '재배시간 70% 감소'
    }
  };

  useEffect(() => {
    const seasonInterval = setInterval(() => {
      setSeason(prev => {
        const seasons = ['봄', '여름', '가을', '겨울'];
        let nextSeason;
        do {
          nextSeason = seasons[Math.floor(Math.random() * seasons.length)];
        } while (nextSeason === prev);  // 현재 계절과 다른 계절이 선택될 때까지 반복

        // 계절이 바뀔 때 날씨도 적절하게 변경
        if (nextSeason === '여름') {
          // 여름에는 한파 제외
          setWeather(['맑음', '비', '흐림', '폭염'][Math.floor(Math.random() * 4)]);
        } else if (nextSeason === '겨울') {
          // 겨울에는 폭염 제외
          setWeather(['맑음', '비', '흐림', '한파'][Math.floor(Math.random() * 4)]);
        } else {
          setWeather(['맑음', '비', '흐림'][Math.floor(Math.random() * 3)]);
        }

        return nextSeason;
      });
    }, 300000);

    return () => clearInterval(seasonInterval);
  }, []);

  useEffect(() => {
    const weatherInterval = setInterval(() => {
      let possibleWeathers;
      switch(season) {
        case '여름':
          // 여름에는 한파 제외
          possibleWeathers = ['맑음', '비', '흐림', '폭염'];
          break;
        case '겨울':
          // 겨울에는 폭염 제외
          possibleWeathers = ['맑음', '비', '흐림', '한파'];
          break;
        default:
          possibleWeathers = ['맑음', '비', '흐림'];
      }
      const newWeather = possibleWeathers[Math.floor(Math.random() * possibleWeathers.length)];
      setWeather(newWeather);
    }, 300000);

    return () => clearInterval(weatherInterval);
  }, [season]);

  useEffect(() => {
    // 초기 시장 가격 설정
    const initialPrices = {};
    Object.entries(cropTypes).forEach(([crop, info]) => {
      initialPrices[crop] = info.basePrice;
    });
    setMarketPrices(initialPrices);

    // 10분마다 가격 변동
    const priceInterval = setInterval(() => {
      setMarketPrices(prev => {
        const newPrices = { ...prev };
        Object.entries(cropTypes).forEach(([crop, info]) => {
          // 5% 단위로 -20% ~ +20% 사이의 랜덤 변동
          const randomMultiplier = Math.floor(Math.random() * 9) * 5 - 20; // -20, -15, -10, -5, 0, 5, 10, 15, 20
          const priceChange = info.basePrice * (1 + randomMultiplier / 100);
          newPrices[crop] = Math.round(priceChange);
        });
        return newPrices;
      });
    }, 600000); // 10분 = 600000ms

    return () => clearInterval(priceInterval);
  }, []);

  const checkGameOver = () => {
    if (crops.length === 0) {  // 농장에 작물이 없을 때
      // 현재 돈 + 인벤토리에 있는 작물들의 판매 가능 금액의 총합
      const totalPotentialMoney = money + Object.values(cropTypes).reduce((sum, crop) => sum + crop.price, 0);
      
      // 가장 저렴한 작물의 가격
      const cheapestCropPrice = Math.min(...Object.values(cropTypes).map(crop => crop.price));
      
      // 보유 현금과 판매 가능한 작물의 가치를 모두 합해도 가장 저렴한 작물을 살 수 없는 경우에만 게임오버
      if (totalPotentialMoney < cheapestCropPrice) {
        setIsGameOver(true);
        return true;
      }
    }
    return false;
  };

  const plantCrop = (type) => {
    if (crops.length >= farmSize) {
      setMessage('농장이 가득 찼습니다!');
      return;
    }
    if (money >= cropTypes[type].price) {
      if (!cropTypes[type].season.includes(season)) {
        setMessage(`${type}는 ${cropTypes[type].season.join(', ')} 에만 심을 수 있습니다!`);
        return;
      }
      setMoney(prev => prev - cropTypes[type].price);
      setCrops(prev => [...prev, {
        type,
        plantedAt: Date.now(),
        stage: 0,
        isGrown: false,
        quality: 1,
        fertilized: false
      }]);
      setMessage(`${type} 씨앗을 심었습니다!`);
    } else {
      setMessage('돈이 부족합니다!');
      checkGameOver();
    }
  };

  const harvestCrop = (index) => {
    const crop = crops[index];
    if (crop.isGrown) {
      // 호미 내구도 체크를 가장 먼저 수행
      if (tools.호미.durability <= 0) {
        setMessage('호미의 내구도가 없습니다. 새로 호미를 구매하세요!');
        return;  // 내구도가 0 이하면 즉시 함수 종료
      }

      // 수확 실패 확률 계산
      const baseFailureRate = 0.03;
      const weatherMultiplier = (weather === '한파' || weather === '폭염') ? 2 : 1;
      const failureRate = baseFailureRate * weatherMultiplier;
      
      // 수확 성공/실패 결정
      if (Math.random() < failureRate) {
        setCrops(prev => prev.filter((_, i) => i !== index));
        setTools(prev => ({
          ...prev,
          호미: {
            ...prev.호미,
            durability: prev.호미.durability - 2.5
          }
        }));
        setMessage(`${crop.type} 수확에 실패했습니다! ${weather === '한파' || weather === '폭염' ? '(악천후로 인한 실패 확률 증가)' : ''}`);
        return;
      }

      // 인벤토리에 작물 추가 수정
      setInventory(prev => ({
        ...prev,
        [crop.type]: (prev[crop.type] || 0) + 1
      }));

      setCrops(prev => prev.filter((_, i) => i !== index));
      setTools(prev => ({
        ...prev,
        호미: {
          ...prev.호미,
          durability: prev.호미.durability - 2.5
        }
      }));
      setMessage(`${crop.type}을(를) 수확했습니다!`);

      setTimeout(() => {
        checkGameOver();
      }, 0);
    }
  };

  const sellCrop = (type) => {
    setInventory(prev => {
      if (!prev[type] || prev[type] <= 0) return prev;
      
      const newInventory = { ...prev };
      newInventory[type] = prev[type] - 1;
      
      if (newInventory[type] <= 0) {
        delete newInventory[type];
      }
      
      const currentPrice = marketPrices[type];
      setMoney(prevMoney => prevMoney + currentPrice);
      setMessage(`${type}을(를) ${currentPrice}원에 판매했습니다! (기준가: ${cropTypes[type].basePrice}원)`);
      
      setTimeout(() => {
        checkGameOver();
      }, 0);
      
      return newInventory;
    });
  };

  const handleToolUse = (toolName, cropIndex) => {
    if (tools[toolName].durability <= 0) {
      setMessage(`${toolName}의 내구도가 다 떨어졌습니다. 수리가 필요합니다!`);
      return false;
    }
    setTools(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        durability: prev[toolName].durability - 10
      }
    }));
    return true;
  };

  const handleFertilizerUse = (type, cropIndex) => {
    if (fertilizers[type] <= 0) {
      setMessage(`${type}가 부족합니다!`);
      return false;
    }
    setFertilizers(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));
    return true;
  };

  const manageCrop = (index, action) => {
    if (action.startsWith('fertilize_')) {
      const fertilizerType = action.replace('fertilize_', '');
      if (!handleFertilizerUse(fertilizerType, index)) return;
      
      setCrops(prev => prev.map((crop, i) => 
        i === index ? { 
          ...crop, 
          fertilized: true,
          fertilizerType: fertilizerType,
          quality: crop.quality * (1 + cropTypes[crop.type].fertilizerEffects[fertilizerType])
        } : crop
      ));
      setMessage(`${fertilizerType}를 사용했습니다! 성장 속도가 ${(cropTypes[crops[index].type].fertilizerEffects[fertilizerType] * 100).toFixed(0)}% 증가합니다.`);
      
      // 비료 사용 후 메뉴 닫기
      const menu = document.getElementById(`crop-menu-${index}`);
      if (menu) {
        menu.classList.add('hidden');
      }
    }
  };

  const expandFarm = () => {
    const expansionCost = farmSize * 1000;
    if (farmSize >= 100) {
      setMessage('농장이 이미 최대 크기입니다!');
      return;
    }
    if (money >= expansionCost) {
      setMoney(prev => {
        const newMoney = prev - expansionCost;
        // 확장 후 게임 오버 체크를 위해 setTimeout 사용
        setTimeout(() => {
          if (crops.length === 0 && newMoney < Math.min(...Object.values(cropTypes).map(crop => crop.price))) {
            setIsGameOver(true);
          }
        }, 0);
        return newMoney;
      });
      setFarmSize(prev => Math.min(prev + 5, 100));  // 최대 100칸으로 제한
      setMessage(`농장이 확장되었습니다! (${farmSize} → ${Math.min(farmSize + 5, 100)})`);
    } else {
      setMessage(`농장 확장을 위해 ${expansionCost}원이 필요합니다.`);
    }
  };

  const buyItem = (itemName) => {
    const item = shopItems[itemName];
    if (money >= item.price) {
      if (itemName === '호미' && tools.호미.durability > 0) {
        setMessage('아직 호미의 내구도가 남아있습니다!');
        return;
      }
      setMoney(prev => {
        const newMoney = prev - item.price;
        // 구매 후 게임 오버 체크를 위해 setTimeout 사용
        setTimeout(() => {
          if (crops.length === 0 && newMoney < Math.min(...Object.values(cropTypes).map(crop => crop.price))) {
            setIsGameOver(true);
          }
        }, 0);
        return newMoney;
      });

      if (itemName in tools) {
        setTools(prev => ({
          ...prev,
          [itemName]: { level: 1, durability: item.durability }
        }));
        setMessage(`${itemName}을(를) 구매했습니다!`);
      } else {
        setFertilizers(prev => ({
          ...prev,
          [itemName]: prev[itemName] + item.amount
        }));
        setMessage(`${itemName}을(를) 구매했습니다!`);
      }
    } else {
      setMessage('돈이 부족합니다!');
    }
  };

  const restartGame = () => {
    setMoney(1000);
    setInventory({});
    setCrops([]);
    setFarmSize(10);
    setTools({
      호미: { level: 1, durability: 100 }
    });
    setFertilizers({
      일반비료: 0,
      고급비료: 0,
      특급비료: 0
    });
    setSeason('봄');
    setWeather('맑음');
    setIsGameOver(false);
    setMessage('');
  };

  const calculateTotalGrowthTime = (crop) => {
    const baseTime = cropTypes[crop.type].growthTime * 1000; // 기본 성장 시간
    let totalTime = baseTime;

    // 비료 효과 적용
    if (crop.fertilized) {
      totalTime *= cropTypes[crop.type].fertilizerEffects[crop.fertilizerType];
    }

    // 날씨 효과 적용
    totalTime *= weatherEffects[weather];

    // 계절 효과 적용 (현재 계절이 작물의 계절이 아닌 경우 30% 더 느리게)
    if (!cropTypes[crop.type].season.includes(season)) {
      totalTime *= 1.3;
    }

    return totalTime;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCrops(prev => prev.map(crop => {
        const totalGrowthTime = calculateTotalGrowthTime(crop);
        const timePassed = Date.now() - crop.plantedAt;
        
        if (timePassed >= totalGrowthTime && !crop.isGrown) {
          const qualityBonus = weatherEffects[weather];
          const finalQuality = crop.quality * qualityBonus * (crop.fertilized ? 1.2 : 1);
          
          setMessage(`${crop.type}이(가) 다 자랐습니다! (품질: ${finalQuality.toFixed(1)})`);
          return { ...crop, stage: 1, isGrown: true, quality: finalQuality };
        }
        return crop;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [weather, season]);

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <div className="max-w-6xl w-full mx-auto">
        {/* 상단 정보 섹션 */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
            <div className="text-xl text-green-600">💰 {money}원</div>
            <div className="text-xl">🌞 {season}</div>
            <div className="text-xl relative group">
              <div className="flex items-center gap-2 cursor-help">
                <span>{weatherIcons[weather]}</span>
                <span>{weather}</span>
              </div>
              <div className="absolute hidden group-hover:block bg-white border border-gray-200 p-4 rounded-lg shadow-lg z-10 w-64 mt-2 right-0">
                <div className="flex flex-col gap-2">
                  <div className="text-lg font-semibold border-b pb-2 mb-2 flex items-center gap-2">
                    {weatherIcons[weather]} {weather}
                  </div>
                  <div className="text-base text-gray-600">
                    {weatherDescriptions[weather]}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {weather === '맑음' && '🌱 성장 속도 10% 증가 ⬆️'}
                    {weather === '비' && '🌱 정상 성장'}
                    {weather === '흐림' && '🌱 정상 성장'}
                    {weather === '폭염' && '🌱 성장 속도 20% 감소 ⬇️'}
                    {weather === '한파' && '🌱 성장 속도 20% 감소 ⬇️'}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl border-l-2 border-gray-300 pl-4">
              호미 내구도: {Math.floor(tools.호미.durability)}%
            </div>
          </div>
        </div>
        
        {/* 메인 컨텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 열 - 상점 */}
          <div className="w-full lg:w-64 bg-white p-4 rounded-lg shadow-md">
            {/* 씨앗 구매 섹션 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-6">씨앗 구매</h3>
              {['봄', '여름', '가을', '겨울'].map((seasonType) => (
                <div key={seasonType} className="mb-6">
                  <h4 className={`text-lg font-semibold mb-4 ${
                    seasonType === '봄' ? 'text-green-600' :
                    seasonType === '여름' ? 'text-yellow-600' :
                    seasonType === '가을' ? 'text-orange-600' :
                    'text-blue-600'
                  }`}>{seasonType} 작물</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                    {Object.entries(cropTypes)
                      .filter(([_, info]) => info.season.includes(seasonType))
                      .map(([type, info]) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.05 }}
                          className={`h-14 px-2 py-2 rounded-lg flex flex-col items-center justify-center ${
                            money >= info.price && season === seasonType
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-300'
                          } text-white transition-colors`}
                          onClick={() => plantCrop(type)}
                          disabled={money < info.price || season !== seasonType}
                          title={season !== seasonType ? `${seasonType}에만 심을 수 있습니다` : ''}
                        >
                          <span className="text-base font-medium leading-tight">{type}</span>
                          <span className="text-sm leading-tight">({info.price}원)</span>
                        </motion.button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 도구 및 비료 구매 섹션 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-6">도구 및 비료 구매</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                {Object.entries(shopItems).map(([item, info]) => (
                  <motion.button
                    key={item}
                    whileHover={{ scale: 1.05 }}
                    className={`relative h-14 px-2 py-2 rounded-lg flex flex-col items-center justify-center ${
                      money >= info.price ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'
                    } text-white transition-colors group`}
                    onClick={() => buyItem(item)}
                    disabled={money < info.price}
                  >
                    <span className="text-base font-medium leading-tight">{item}</span>
                    <span className="text-sm leading-tight">({info.price}원)</span>
                    
                    {/* 비료 설명 툴팁 */}
                    {item.includes('비료') && (
                      <div className="absolute hidden group-hover:block bg-white border border-gray-200 p-3 rounded-lg shadow-lg z-10 w-48 -top-16 left-1/2 transform -translate-x-1/2">
                        <div className="text-gray-700 text-sm">
                          {info.description}
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 농장 확장 섹션 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-6">농장 확장</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`w-full h-14 rounded-lg flex flex-col items-center justify-center ${
                  money >= farmSize * 1000 && farmSize < 100
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-300'
                } text-white transition-colors`}
                onClick={expandFarm}
                disabled={money < farmSize * 1000 || farmSize >= 100}
                title={farmSize >= 100 ? '농장이 최대 크기입니다' : `확장 비용: ${farmSize * 1000}원`}
              >
                <span className="text-base font-medium leading-tight">농장 확장</span>
                <span className="text-sm leading-tight">({farmSize}/100칸) - {farmSize * 1000}원</span>
              </motion.button>
            </div>
          </div>

          {/* 오른쪽 열 - 농장 */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <h3 className="text-xl font-bold mb-4">농장 ({crops.length}/{farmSize}칸)</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {crops.slice(0, farmSize).map((crop, index) => {
                  const elapsedTime = Date.now() - crop.plantedAt;
                  const totalGrowthTime = calculateTotalGrowthTime(crop);
                  const secondsLeft = Math.max(0, Math.ceil((totalGrowthTime - elapsedTime) / 1000));
                  const isGrown = elapsedTime >= totalGrowthTime;

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      className="relative text-4xl cursor-pointer p-4 bg-green-100 rounded-lg flex flex-col items-center justify-center w-[100px] h-[100px]"
                      onClick={() => harvestCrop(index)}
                    >
                      <div className="absolute left-2 top-1 text-xs font-medium text-gray-600">
                        {crop.type}
                      </div>
                      <div>{cropTypes[crop.type].growthStages[isGrown ? 1 : 0]}</div>
                      {!isGrown && (
                        <>
                          <div className="absolute left-2 bottom-2 text-sm font-bold text-gray-700">
                            {secondsLeft}초
                          </div>
                          <div className="absolute right-2 bottom-2">
                            <div className="relative group">
                              <button 
                                className="text-xs bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const menu = document.getElementById(`crop-menu-${index}`);
                                  if (menu) {
                                    menu.classList.toggle('hidden');
                                  }
                                }}
                              >
                                ⚙️
                              </button>
                              <div 
                                id={`crop-menu-${index}`}
                                className="hidden absolute right-0 bottom-full mb-2 w-32 bg-white rounded-lg shadow-lg z-50"
                              >
                                <div className="py-1">
                                  {Object.entries(fertilizers).map(([type, count]) => (
                                    count > 0 && (
                                      <button
                                        key={type}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          manageCrop(index, `fertilize_${type}`);
                                        }}
                                      >
                                        <span>{type}</span>
                                        <span className="text-xs text-gray-500">({count})</span>
                                      </button>
                                    )
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {crop.fertilized && (
                        <div className="absolute right-2 top-2 text-xs">
                          💊
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {[...Array(farmSize - crops.length)].map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="text-4xl p-4 bg-gray-100 rounded-lg flex items-center justify-center w-[100px] h-[100px]"
                  >
                    🟫
                  </div>
                ))}
              </div>

              {/* 인벤토리 */}
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">인벤토리</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {Object.entries(inventory).map(([type, count]) => {
                    const currentPrice = marketPrices[type];
                    const basePrice = cropTypes[type].basePrice;
                    const priceChange = ((currentPrice - basePrice) / basePrice * 100).toFixed(1);
                    const priceColor = priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-gray-600';
                    
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 w-[130px] h-[80px] flex flex-col items-center justify-center"
                        onClick={() => sellCrop(type)}
                      >
                        <div className="text-2xl">
                          {cropTypes[type].growthStages[1]}
                        </div>
                        <div className="text-sm text-center">
                          {type}: {count}개
                        </div>
                        <div className={`${priceColor} text-xs text-center`}>
                          {currentPrice}원
                          {priceChange !== '0.0' && (
                            <span> ({priceChange > 0 ? '+' : ''}{priceChange}%)</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Minigame;