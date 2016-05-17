Installing
==========

Requirements
------------

Windows
~~~~~~~

- `NodeJS`_ - Requires v5.0.0 or above due to ES6 code.

- `Python 2.7`_ - Requires v2.7.x, not v3.x.x.

- `Visual Studio`_ - Select Custom Installation and make sure Visual C++ under Programming Languages is selected.

  - Your Visual Studio installation ideally has to be recent.
  - Can be Express, Community or Enterprise Edition, but NOT ``VS Code``.

- `FFmpeg`_ - Add bin folder to PATH Environment Variable.

Mac
~~~

- `NodeJS`_ - Requires v5.0.0 or above due to ES6 code.

- `Python 2.7`_ - Requires v2.7.x, not v3.x.x. Should be already installed by default.

- Xcode Command Line Tools

.. code-block:: bash

	$ xcode-select --install
	
- FFmpeg

.. code-block:: bash

    $ brew install ffmpeg

Linux (Debian-based)
~~~~~~~~~~~~~~~~~~~~

- `NodeJS Linux`_ - Requires v5.0.0 or above due to ES6 code.

- `Python 2.7`_ - Requires v2.7.x, not v3.x.x. Should be already installed by default.

- Build Essential

.. code-block:: bash

	$ sudo apt-get install build-essential
    
- FFmpeg

.. code-block:: bash

    $ sudo apt-get install ffmpeg

If on Ubuntu 14.04, use this instead:

.. code-block:: bash

    $ sudo add-apt-repository ppa:mc3man/trusty-media && sudo apt-get update && sudo apt-get install ffmpeg
    
-------------------------------------------------

Installation
------------

1. Download the repository. (You can use git clone or the Download ZIP button Github provides.)
2. Open the :ref:`config-json` file and edit it.
3. Open a Command Prompt/Terminal at the directory of the downloaded repository.
4. Run ``npm install`` to install the dependencies.
5. Run ``npm start`` to start up the bot.
6. Start using the bot!

.. _Visual Studio : https://www.visualstudio.com/downloads/download-visual-studio-vs
.. _Python 2.7 : https://www.python.org/downloads/release/python-2711/
.. _FFmpeg : https://www.ffmpeg.org/download.html
.. _NodeJS : https://nodejs.org/en/download/
.. _NodeJS Linux : https://nodejs.org/en/download/package-manager/