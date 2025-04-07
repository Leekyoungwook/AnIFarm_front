import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import SaleNews from './SaleNews';
import TrainNews from './TrainNews';

const News = () => {
  // 'price'와 'development'로 탭을 구분합니다.
  const [activeTab, setActiveTab] = useState('price');

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <div className="w-full max-w-[1280px] px-4 mx-auto pb-12">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="news tabs"
            centered
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
              label="가격 관련 뉴스"
              value="price"
              sx={{ '&.Mui-selected': { color: '#2e7d32' } }}
            />
            <Tab
              label="육성 관련 뉴스"
              value="development"
              sx={{ '&.Mui-selected': { color: '#2e7d32' } }}
            />
          </Tabs>
        </Box>
        {activeTab === 'price' ? <SaleNews /> : <TrainNews />}
      </div>
    </div>
  );
};

export default News;