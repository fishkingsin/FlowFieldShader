//
//  This file is part of the ofxFastParticleSystem [https://github.com/fusefactory/ofxFastParticleSystem]
//  Copyright (C) 2018 Fuse srl
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

#pragma once

//OF
#include "ofMain.h"
//addons
#include "ofxFastParticleSystem.h"
#include "ofxAutoReloadedShader.h"

class ofApp : public ofBaseApp{
	
public:
	void setup();
	void update();
	void draw();
	
	void keyPressed(int key);
	
private:
	int shaderId = 0;
	
	int		densityWidth, densityHeight, simulationWidth, simulationHeight, windowWidth, windowHeight;
	
	ofxAutoReloadedShader shaderA;
	ofxAutoReloadedShader shaderB;
	ofxAutoReloadedShader shaderDraw;
	//32 bits red, 32 bits green, 32 bits blue, from 0 to 1 in 'infinite' steps
	ofFbo fboBufferB; // with alpha
	ofFbo fboBufferA; // with alpha
	
	ofFbo fboImage; // with alpha
	int frame = 0;
};
