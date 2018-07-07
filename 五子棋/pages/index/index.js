//index.js
 import FiveStone from '../../FiveStone/FiveStone';

(function () {
  //获取应用实例
  var app = getApp();

  /**
   * 控制下子提示的视图显示
   */
  function handleTip(e) {
    const self = getCurrentPages()[1];  //第二个界面当前单机界面的Page
    if (!self.fiveStone.canStep()) {
      return;
    }

    const stepTipPos = self.fiveStone.getStepPosition(e);
    self.loc = self.fiveStone.getStepLocation(e);
    //如果没有获取到下子的位置，隐藏掉下子提示
    if (stepTipPos == null) {
      self.setData({
        showStepTip:false
      });
      return;
    }
    //设置并显示下子提示的位置
    self.setData({
      'stepTipPos':stepTipPos,
      showStepTip:true
    });
  }

  /**
   * 胜利之后的回调
   */
  function winCallback(winStone, endLoc, startLoc) {
    var that = this;
    const page = getCurrentPages()[1];    //page对象
    const startLocation = this.chessBoard[startLoc.x][startLoc.y].pos;
    const endLocation = this.chessBoard[endLoc.x][endLoc.y].pos;
    const long = Math.sqrt(Math.pow(endLocation.x - startLocation.x, 2) +   //红线的长度
                           Math.pow(endLocation.y - startLocation.y, 2));
    const tipAngle = Math.acos((startLocation.x - endLocation.x) / long); //余弦值对应的角度
    console.log(tipAngle);
    page.setData({
      winLoc:{
        start:startLocation,
        end:endLocation,
        width:long,
        angle:tipAngle
      }
    });
    wx.showModal({
      title: '提示',
      content: page.fiveStone.stone == 2 ? '黑棋获胜了' : '白旗获胜了',
      confirmText:"再来一局",
      success: function (res) {
        if (res.confirm) {
          page.restart();
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    }) 
    //已经成功以后禁止再下子
    page.fiveStone.preventStep();
  }

  Page({
    data: {
      showStepTip:false,
      stepTipPos:{
        x:0,
        y:0
      },
      winLoc:{
        start:null,
        end:null
      }
    },
    onChessBoardTouchStart: function (e) {
      handleTip(e);
    },
    onChessBoardTouchMove: function (e) {
      handleTip(e);
    },
    onChessBoardTouchEnd: function (e) {
      this.setData({
        showStepTip:false
      });
      const loc = this.loc;
      if (loc != null) {
        this.fiveStone.step(loc.x, loc.y);
        this.refreshFiveStone();
      }
    },
    /**
     * 重来
     */
    restart: function () {
      this.fiveStone.restart();
      this.refreshFiveStoneAndClearWinTip();
    },
    /**
     * 悔棋
     */
    undo: function () {
      this.fiveStone.undo();
      this.refreshFiveStoneAndClearWinTip();
    },
    refreshFiveStone: function () {
      this.setData({
        'fiveStone':this.fiveStone
      });
    },
    refreshFiveStoneAndClearWinTip: function () {
      this.setData({
        'fiveStone':this.fiveStone,
        'winLoc':{
          start:null,
          end:null
        }
      });
    },
    onLoad: function () {
      console.log('onLoad')
      //初始化棋盘
      this.fiveStone = new FiveStone(15, 0.9);
      this.fiveStone.setWinCallback(winCallback);
      //调用应用实例的方法获取全局数据
      var that = this;
      app.getUserInfo(function (userInfo) {
        that.setData({
          userInfo: userInfo
        })
        wx.request({
  url: 'https://zerodegreeli.cn/fiveStone/room/add.php',
  data: {
    user: that.data.userInfo.nickName,
    fiveStone: that.data.fiveStone.chessBoard,
    secondUser: "null"
  },
  header: {
    'content-type': 'application/json' // 默认值
  },
  success: function (res) {
    console.log(res.data)
  }
})
      })
      //这里不使用refreshFiveStone的原因是因为这里是初始化，区别出后面的刷新
      
      this.setData({
        fiveStone:this.fiveStone
      });
      this.loc = null;      
    }
  })
})();

// wx.request({
//   url: 'https://zerodegreeli.cn/fiveStone/room/add.php',
//   data: {
//     user: that.data.userInfo.nickName,
//     fiveStone: "test",
//     secondUser: "null"
//   },
//   header: {
//     'content-type': 'application/json' // 默认值
//   },
//   success: function (res) {
//     console.log(res.data)
//   }
// })
