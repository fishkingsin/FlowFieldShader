#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
	ofSetLogLevel(OF_LOG_VERBOSE);
	
	shaderA.load("shaders/bufferA");
	shaderB.load("shaders/bufferB");
	shaderDraw.load("shaders/draw");
	
	
	
	densityWidth = 1280;
	densityHeight = 720;
	// process all but the density on 16th resolution
	simulationWidth = densityWidth / 2;
	simulationHeight = densityHeight / 2;
	windowWidth = ofGetWindowWidth();
	windowHeight = ofGetWindowHeight();
	fboBufferB.allocate(densityWidth, densityHeight, GL_RGBA32F_ARB);
	fboBufferA.allocate(densityWidth, densityHeight, GL_RGBA32F_ARB);
	fboImage.allocate(densityWidth, densityHeight, GL_RGBA32F_ARB);
	
	
}

//--------------------------------------------------------------
void ofApp::update(){
	float dt = 1.0 / max(ofGetFrameRate(), 1.f); // more smooth as 'real' deltaTime.
	fboBufferB.begin();
	ofFill();
	ofSetColor(255,255,255, 5);
	ofDrawRectangle(0, 0, densityWidth, densityHeight);
	fboBufferB.end();
	// apply noiseshader to fbo
	fboBufferA.begin();
	shaderA.begin();
	shaderA.setUniform3f("iResolution", densityWidth, densityHeight, 0);
	shaderA.setUniform1f("texCoordWidthScale", densityWidth);
	shaderA.setUniform1f("texCoordHeightScale", densityHeight);
	shaderA.setUniform1f("iTime", ofGetElapsedTimef());
	shaderA.setUniform1i("iFrame", ofGetFrameNum());
	shaderA.setUniformTexture("tex0", fboImage.getTexture() , 1 );
	shaderA.setUniformTexture("tex1", fboBufferA.getTexture() , 2);
	shaderA.setUniformTexture("tex2", fboBufferB.getTexture() , 3);
	fboImage.draw(0 ,0);
	shaderA.end();
	
	fboBufferA.end();
	
	fboBufferB.begin();
	shaderB.begin();
	shaderB.setUniform3f("iResolution", densityWidth, densityHeight, 0);
	shaderB.setUniform1f("texCoordWidthScale", densityWidth);
	shaderB.setUniform1f("texCoordHeightScale", densityHeight);
	shaderB.setUniform1f("iTime", ofGetElapsedTimef());
	shaderB.setUniform1i("iFrame", ofGetFrameNum());
	shaderB.setUniformTexture("tex0", fboImage.getTexture() , 1 );
	shaderB.setUniformTexture("tex1", fboBufferA.getTexture() , 2);
	shaderB.setUniformTexture("tex2", fboBufferB.getTexture() , 3);

	fboBufferA.draw(0 ,0);
	shaderB.end();
	
	fboBufferB.end();
	
	fboImage.begin();
	shaderDraw.begin();
	shaderDraw.setUniform3f("iResolution", densityWidth, densityHeight, 0);
	shaderDraw.setUniform1f("texCoordWidthScale", densityWidth);
	shaderDraw.setUniform1f("texCoordHeightScale", densityHeight);
	shaderDraw.setUniform1f("iTime", ofGetElapsedTimef());
	shaderDraw.setUniform1i("iFrame", ofGetFrameNum());
	shaderDraw.setUniformTexture("tex0", fboImage.getTexture() , 1 );
	shaderDraw.setUniformTexture("tex1", fboBufferA.getTexture() , 2);
	shaderDraw.setUniformTexture("tex2", fboBufferB.getTexture() , 3);

	fboBufferB.draw(0 ,0);
	shaderDraw.end();
	
	fboImage.end();
}

//--------------------------------------------------------------
void ofApp::draw(){
	int width = windowWidth * 0.25;
	int height = windowHeight * 0.25;
	fboBufferA.draw(0, 0, width, height);
	fboBufferB.draw(width, 0, width, height);
	fboImage.draw(0, height, width, height);
}




//--------------------------------------------------------------
void ofApp::keyPressed(int key){
}
