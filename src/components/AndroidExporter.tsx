import React, { useState } from 'react';
import { X, Code, Folder, Download, Check, FileCode, Smartphone, Terminal, Copy } from 'lucide-react';

interface AndroidExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExporter: React.FC<AndroidExporterProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeFile, setActiveFile] = useState<'manifest' | 'gradle' | 'main' | 'timer' | 'room'>('main');
  const [copied, setCopied] = useState(false);

  const fileContents = {
    manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.studytube.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="StudyTube"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.StudyTube">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.StudyTube">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,

    gradle: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("kotlin-kapt")
}

android {
    namespace = "com.studytube.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.studytube.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    
    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
}`,

    main: `package com.studytube.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.studytube.app.ui.theme.StudyTubeTheme
import com.studytube.app.ui.screens.MainHomeScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StudyTubeTheme(darkTheme = true) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainHomeScreen()
                }
            }
        }
    }
}`,

    timer: `package com.studytube.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class StudyTimerViewModel : ViewModel() {
    private val _secondsLeft = MutableStateFlow(40 * 60)
    val secondsLeft: StateFlow<Int> = _secondsLeft

    private val _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning

    fun startTimer() {
        _isRunning.value = true
        viewModelScope.launch {
            while (_isRunning.value && _secondsLeft.value > 0) {
                delay(1000)
                _secondsLeft.value -= 1
            }
        }
    }

    fun pauseTimer() {
        _isRunning.value = false
    }

    fun resetTimer(minutes: Int = 40) {
        _isRunning.value = false
        _secondsLeft.value = minutes * 60
    }
}`,

    room: `package com.studytube.app.data

import androidx.room.*

@Entity(tableName = "study_sessions")
data class StudySessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val date: String,
    val durationMinutes: Int,
    val subject: String,
    val timestamp: Long
)

@Dao
interface StudySessionDao {
    @Query("SELECT * FROM study_sessions ORDER BY timestamp DESC")
    suspend fun getAllSessions(): List<StudySessionEntity>

    @Insert
    suspend fun insertSession(session: StudySessionEntity)
}

@Database(entities = [StudySessionEntity::class], version = 1)
abstract class StudyDatabase : RoomDatabase() {
    abstract fun studySessionDao(): StudySessionDao
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Android Studio Kotlin Project Codebase</h3>
              <p className="text-[11px] text-slate-400">Complete Material 3 + Room DB + Clean Architecture source files</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation file tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveFile('main')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFile === 'main' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> MainActivity.kt
          </button>
          <button
            onClick={() => setActiveFile('timer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFile === 'timer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> StudyTimerViewModel.kt
          </button>
          <button
            onClick={() => setActiveFile('room')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFile === 'room' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> StudyDatabase.kt (Room)
          </button>
          <button
            onClick={() => setActiveFile('manifest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFile === 'manifest' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> AndroidManifest.xml
          </button>
          <button
            onClick={() => setActiveFile('gradle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFile === 'gradle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> build.gradle.kts
          </button>
        </div>

        {/* Code view */}
        <div className="p-4 bg-slate-950 flex-1 overflow-y-auto font-mono text-xs text-indigo-200 leading-relaxed">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-sans text-xs">Path: /android/app/...</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-sans font-semibold flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy File'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{fileContents[activeFile]}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Check className="w-4 h-4" /> Ready for Android Studio Electric Eel & Ladybug
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
