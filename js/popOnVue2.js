const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    apiData:[],
    
    // 當前日期
    nowDate:new Date(),

    // 截止日期
    finshedData:new Date(2023,1,28,23,59,59,59),
    isGeted:false,
    // 計數器
    display:{
      days:0,
      hours:0,
      mins:0,
      secs:0,
    },
    // chart Data
    chartlabel:[],
    chartData:[],
    chartLineData:[],
  },
  methods: {
    getApiData(){
      _this = this;
      Swal.fire({
          title: 'Are you sure?',
          // title: 'Error!',
          text: 'Do you want to get ApiData?',
          icon: 'info',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
          
          showCancelButton: true,
          cancelButtonText:'Empty DataList',
          cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed && !_this.isGeted) {
              Swal.fire(
                'Api DataList update',
                'Please check your DataList.',
                'success'
              )
              axios
              .get('https://testnet.binancefuture.com/dapi/v1/premiumIndex')
              .then(res =>{
                // console.log(res.data)
                _this.apiData = [];
                res.data.forEach(el => {
                  _this.apiData.push(el);
                });

                // 市價前10排名排序
                _this.apiData.sort(function(a, b) {
                    return b.markPrice - a.markPrice;
                })
                
                // console.log(_this.apiData);
                maxLevel = 9 //0 ~ 9,共10名
                _this.apiData.forEach((el,idx)=>{
                    // sysbol in charts
                    if(idx <= maxLevel ){
                      _this.chartlabel.push(el.symbol.split('_')[0]);
                      _this.chartData.push(el.markPrice);
                      _this.chartLineData.push(el.indexPrice);
                    }
                    
                  })


                _this.isGeted = true;
                _this.drawChart();
                
              })
              .catch(function (error) { 
                console.log(error);
              });

            }else{
              _this.isGeted = false;

              _this.apiData = [];
              _this.chartlabel=[];
              _this.chartLineData = [];
              _this.chartData = [];
            }
          })
    },
    showRemain(){
      // 啟動計時器
      const timer = setInterval(()=>{
      const now = new Date();
      const end = this.finshedData;

      const timeDiff = end.getTime() - now.getTime();
        
      if(timeDiff < 0){
        clearInterval(timer)
        return alert('timer over')
      }

      const days = Math.floor(timeDiff / this._days);
      const hours = Math.floor(timeDiff % this._days / this._hours);
      const mins = Math.floor(timeDiff % this._hours / this._mins);
      const secs = Math.floor(timeDiff % this._mins / this._secs);

      // DD HH:MM:SS 時間格式
      this.display.mins = mins < 10 ? "0" + mins :mins;
      this.display.secs = secs < 10 ? "0" + secs :secs;
      this.display.hours = hours < 10 ? "0" + hours :hours;
      this.display.days = days < 10 ? "0" + days :days;
      },800)
    
    },
    drawChart(){
      _this = this;
      // console.log(_this.chartData)
      var ctx = document.getElementById('myChart').getContext('2d');
      var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels:_this.chartlabel,
        datasets: 
        [
          {
            label: 'Top10 of currentPair ',
            
            // data: [12, 19, 3, 5, 2, 3],
            
            data: _this.chartData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 2
          },
          {
            type: 'line',
            label: 'indexPrice Line',
            data: _this.chartLineData,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
          }
        ],
          options: {
            // indexAxis: 'y',
          }
      },
    
      });
    }
  },
  mounted: function(){
    this.showRemain();
  },
  computed:{
    _secs:()=>1000,
    _mins(){
      return this._secs* 60;
    },
    _hours(){
      return this._mins * 60;
    },
    _days(){
      return this._hours * 24;
    },

    itemsCovert() {
      return this.apiData.map(item => {
      // console.log(item.nextFundingTime)
      // console.log(item)

      // 1. 交易對 Symbol：貨幣交易對，例如
      const symbol = item.symbol;
      // 2. 標記價格 Mark Price
      const markPrice = item.markPrice;
      // 3. 指數價格 Index Price
      const indexPrice = item.indexPrice;
      
      // 4. 下次資金費率結算時間 Next Funding Time
      
      const totalSeconds = Math.floor(item.nextFundingTime / 1000);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;
      const totalHours = Math.floor(totalMinutes / 60);
      const hours = totalHours % 24;
      const days = Math.floor(totalHours / 24);
      
      // console.log(days)
        return {
          computedValue:`
          Symbol:${symbol},
          markPrice:${markPrice},
          indexPrice:${indexPrice},
          nextFundingTime: 
           ${days.toString().padStart(2, '0')}, ${hours.toString().padStart(2, '0')}
          :${minutes.toString().padStart(2, '0')} :${seconds.toString().padStart(2, '0')}`,
        };
      });
      },
      
  }
})