// Constructor
function AuroraPanel(id) {
  this.id = id;
  this.frameCount = 1;
  this.r = 255;
  this.g = 255;
  this.b = 255;
  this.w = 0;
  this.t = 0;
};

// class methods
AuroraPanel.prototype.formatForRequest = function () {
  return `${this.id} ${this.frameCount} ${this.r} ${this.g} ${this.b} ${this.w} ${this.t} `;
};

// export the class
module.exports = AuroraPanel;